import styles from './Profile.module.scss'
import ProfileInfo from '@/components/ProfileInfo/ProfileInfo';


const Profile = () => {
    return (
        <div className={styles.profile}>
            <div className={styles.sidebar}>
                <ProfileInfo />
            </div>
            <div className={styles.content}>ewewqew</div>
        </div>
    );
};

export default Profile