const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';
const MAX_IMAGE_SIZE = 32 * 1024 * 1024;
const MAX_IMAGES_PER_REQUEST = 10;

interface ImgBBResponse {
	success: boolean;
	data?: {
		id: string;
		url: string;
		display_url: string;
		delete_url: string;
	};
	error?: {
		message?: string;
	};
}

type ImageUploadResult =
	| { success: true; id: string; url: string; displayUrl: string; deleteUrl: string }
	| { success: false; error: string };

async function uploadImage(image: File, apiKey: string): Promise<ImageUploadResult> {
	const uploadForm = new FormData();
	uploadForm.append('image', image);

	try {
		const response = await fetch(`${IMGBB_UPLOAD_URL}?key=${encodeURIComponent(apiKey)}`, {
			method: 'POST',
			body: uploadForm,
		});
		const result = (await response.json()) as ImgBBResponse;

		if (!response.ok || !result.success || !result.data) {
			return { success: false, error: result.error?.message ?? 'imgbb не смог загрузить изображение' };
		}

		return {
			success: true,
			id: result.data.id,
			url: result.data.url,
			displayUrl: result.data.display_url,
			deleteUrl: result.data.delete_url,
		};
	} catch {
		return { success: false, error: 'Не удалось связаться с imgbb или прочитать его ответ' };
	}
}

export async function POST(request: Request) {
	const apiKey = process.env.IMGBB_API_KEY;

	if (!apiKey) {
		return Response.json({ error: 'Сервер не настроен для загрузки изображений' }, { status: 500 });
	}

	let images: FormDataEntryValue[];

	try {
		const formData = await request.formData();
		images = [...formData.getAll('images'), ...formData.getAll('image')];
	} catch {
		return Response.json({ error: 'Не удалось прочитать форму загрузки' }, { status: 400 });
	}

	if (images.length === 0 || images.some((image) => !(image instanceof File))) {
		return Response.json({ error: 'Передайте изображения в поле images' }, { status: 400 });
	}

	if (images.length > MAX_IMAGES_PER_REQUEST) {
		return Response.json({ error: `За один запрос можно загрузить не более ${MAX_IMAGES_PER_REQUEST} изображений` }, { status: 413 });
	}

	const files = images as File[];

	if (files.some((image) => !image.type.startsWith('image/'))) {
		return Response.json({ error: 'Можно загружать только изображения' }, { status: 400 });
	}

	if (files.some((image) => image.size > MAX_IMAGE_SIZE)) {
		return Response.json({ error: 'Размер каждого изображения не должен превышать 32 МБ' }, { status: 413 });
	}

	const results = await Promise.all(files.map((image) => uploadImage(image, apiKey)));
	const hasFailures = results.some((result) => !result.success);

	return Response.json({ images: results }, { status: hasFailures ? 502 : 200 });
}
