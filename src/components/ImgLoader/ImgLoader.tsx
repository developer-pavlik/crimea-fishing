import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import styles from './ImgLoader.module.scss'
import { Button } from '../ui/Button/Button';
import PhotoIcon from '../../../public/icons/photo.svg';
import DeleteIcon from '../../../public/icons/delete.svg';
import LoaderIcon from '../../../public/icons/loader.svg';
import OkIcon from '../../../public/icons/checkmark.svg';
import Image from 'next/image';

interface ImgLoaderProps {
    imagesUrl?: string[];
}

type ImageStatus = 'loading' | 'loaded' | 'error';

interface ImagePreview {
    id: string;
    previewUrl: string;
    status: ImageStatus;
    uploadedUrl?: string;
    error?: string;
}

type ImageUploadResult =
    | { success: true; url: string; displayUrl: string }
    | { success: false; error: string };

interface ImageUploadResponse {
    images?: ImageUploadResult[];
    error?: string;
}

interface FileTypeError {
    id: string;
    message: string;
}

const ImgLoader = ({ imagesUrl = [] }: ImgLoaderProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const objectUrlsRef = useRef<string[]>([]);
    const [uploadedImages, setUploadedImages] = useState<ImagePreview[]>([]);
    const [removedInitialImageIds, setRemovedInitialImageIds] = useState<Set<string>>(() => new Set());
    const [fileTypeError, setFileTypeError] = useState<FileTypeError | null>(null);

    useEffect(() => () => {
        objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    }, []);

    useEffect(() => {
        if (!fileTypeError) return;

        const timeoutId = window.setTimeout(() => setFileTypeError(null), 7000);
        return () => window.clearTimeout(timeoutId);
    }, [fileTypeError]);

    const handleFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.currentTarget.files ?? []);
        event.currentTarget.value = '';

        const files = selectedFiles.filter((file) => file.type.startsWith('image/'));

        if (files.length < selectedFiles.length) {
            setFileTypeError({
                id: crypto.randomUUID(),
                message: 'Можно загружать только файлы изображений.',
            });
        }

        if (files.length === 0) return;

        const newImages = files.map((file) => {
            const previewUrl = URL.createObjectURL(file);
            objectUrlsRef.current.push(previewUrl);

            return {
                id: crypto.randomUUID(),
                previewUrl,
                status: 'loading' as const,
            };
        });

        setUploadedImages((currentImages) => [...currentImages, ...newImages]);

        const updateImageStatus = (
            id: string,
            status: ImageStatus,
            details: { error?: string; uploadedUrl?: string } = {},
        ) => {
            setUploadedImages((currentImages) => currentImages.map((image) =>
                image.id === id ? { ...image, status, ...details } : image
            ));
        };

        await Promise.all(files.map(async (file, index) => {
            const imageId = newImages[index].id;
            const formData = new FormData();
            formData.append('images', file);

            try {
                const response = await fetch('/api/image-upload', {
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json() as ImageUploadResponse;
                const uploadResult = result.images?.[0];

                if (response.ok && uploadResult?.success) {
                    updateImageStatus(imageId, 'loaded', { uploadedUrl: uploadResult.url });
                } else {
                    const error = uploadResult && !uploadResult.success
                        ? uploadResult.error
                        : result.error ?? `Ошибка загрузки: ${response.status}`;
                    updateImageStatus(imageId, 'error', { error });
                }
            } catch {
                updateImageStatus(imageId, 'error', { error: 'Не удалось связаться с сервером загрузки' });
            }
        }));
    };

    const handleDeleteImage = (imageId: string) => {
        const uploadedImage = uploadedImages.find((image) => image.id === imageId);

        if (uploadedImage) {
            URL.revokeObjectURL(uploadedImage.previewUrl);
            setUploadedImages((currentImages) => currentImages.filter((image) => image.id !== imageId));
            return;
        }

        setRemovedInitialImageIds((currentIds) => new Set(currentIds).add(imageId));
    };

    const handleClearImages = () => {
        uploadedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
        setUploadedImages([]);
        setRemovedInitialImageIds((currentIds) => new Set([
            ...currentIds,
            ...imagesUrl.map((previewUrl, index) => `initial-${index}-${previewUrl}`),
        ]));
    };

    const visibleImages = [
        ...imagesUrl.map((previewUrl, index) => ({
            id: `initial-${index}-${previewUrl}`,
            previewUrl,
            uploadedUrl: previewUrl,
            status: 'loaded' as const,
        })),
        ...uploadedImages,
    ].filter((image) => !removedInitialImageIds.has(image.id));
    const imageUrls = visibleImages
        .filter((image) => image.status === 'loaded' && image.uploadedUrl)
        .map((image) => image.uploadedUrl);

    return (
        <div className={styles.imgLoader}>
            <div className={styles.title}>Изображения товара</div>
            <div className={styles.items}>
                {visibleImages.length === 0 ? (
                    <PhotoIcon className={styles.emptyView} />
                ) : visibleImages.map((image, index) => (
                    <div className={styles.item} key={image.id}>
                        <div className={styles.preview}>
                            <Image className={styles.previewImg} src={image.previewUrl} fill alt={`Изображение товара ${index + 1}`} unoptimized={image.previewUrl.startsWith('blob:')} />
                            <div className={styles.imgStatus}>
                                {/* <LoaderIcon className={styles.loader} /> */}
                                {image.status === 'loading' ? (
                                    <LoaderIcon className={styles.loader} />
                                ) : image.status === 'error' ? (
                                    <div className={styles.error} title={image.error}>!</div>
                                ) : (
                                    <div className={styles.isLoaded}>
                                        <OkIcon className={styles.isLoadedIcon}/>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button className={styles.deleteButton} type="button" aria-label={`Удалить изображение ${index + 1}`} onClick={() => handleDeleteImage(image.id)}>
                            <DeleteIcon className={styles.deleteIcon} />
                        </button>
                    </div>
                ))}
            </div>
            <input type="hidden" name="imgUrls" value={JSON.stringify(imageUrls)} />
            <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFilesChange} />
            <div className={styles.panel}>
                <Button view='negative' type="button" onClick={handleClearImages}>Удалить все</Button>
                <Button type="button" onClick={() => fileInputRef.current?.click()}>Добавить</Button>
            </div>
            {/* Тут вывести сообщение об ошибке типа файла */}
            {fileTypeError && <div role="alert" className={styles.globalError}>{fileTypeError.message}</div>}
        </div>
    );
};

export default ImgLoader