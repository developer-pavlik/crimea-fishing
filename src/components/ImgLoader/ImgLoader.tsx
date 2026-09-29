import styles from './ImgLoader.module.scss'
import { Button } from '../ui/Button/Button';
import PhotoIcon from '../../../public/icons/photo.svg';
import DeleteIcon from '../../../public/icons/delete.svg';
import LoaderIcon from '../../../public/icons/loader.svg';
import OkIcon from '../../../public/icons/checkmark.svg';
import Image from 'next/image';

const ImgLoader = () => (
    <div className={styles.imgLoader}>
        <div className={styles.title}>Изображения товара</div>
        <div className={styles.items}>
            {/* <PhotoIcon className={styles.emptyView} /> */}
            <div className={styles.item}>
                <div className={styles.preview}>
                    <Image className={styles.previewImg} src="https://ir.ozone.ru/s3/multimedia-1-j/wc2500/10706974903.jpg" fill alt="" />
                    <div className={styles.imgStatus}>
                        {/* <LoaderIcon className={styles.loader} /> */}
                        {/* <div className={styles.isLoaded}>
                            <OkIcon className={styles.isLoadedIcon}/>
                        </div> */}
                        <div className={styles.error}>!</div>
                    </div>
                </div>
                <button className={styles.deleteButton}>
                    <DeleteIcon className={styles.deleteIcon} />
                </button>
            </div>
        </div>
        <div className={styles.panel}>
            <Button view='negative' type="button">Удалить все</Button>
            <Button type="button">Добавить</Button>
        </div>
    </div>
);

export default ImgLoader