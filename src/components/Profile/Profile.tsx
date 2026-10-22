import styles from './Profile.module.scss'
import ProfileInfo from '@/components/ProfileInfo/ProfileInfo';
import type { PublicUserProfile } from '@/lib/users';

type ProfileProps = {
    profile: PublicUserProfile;
    isOwnProfile: boolean;
};

const Profile = ({ profile, isOwnProfile }: ProfileProps) => {
    return (
        <div className={styles.profile}>
            <div className={styles.sidebar}>
                <ProfileInfo profile={profile} isOwnProfile={isOwnProfile} />
            </div>
            <div className={styles.content}>ewewqew</div>
        </div>
    );
};

export default Profile;
