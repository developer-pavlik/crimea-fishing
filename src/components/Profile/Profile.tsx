import type { ReactNode } from 'react';
import styles from './Profile.module.scss'
import ProfileInfo from '@/components/ProfileInfo/ProfileInfo';
import type { PublicUserProfile } from '@/lib/users';

type ProfileProps = {
    profile: PublicUserProfile;
    isOwnProfile: boolean;
    children?: ReactNode;
};

const Profile = ({ profile, isOwnProfile, children }: ProfileProps) => {
    return (
        <div className={styles.profile}>
            <div className={styles.sidebar}>
                <ProfileInfo profile={profile} isOwnProfile={isOwnProfile} />
            </div>
            <div className={styles.content}>
                {children ?? 'Тут выводится грид товаров.'}
            </div>
        </div>
    );
};

export default Profile;
