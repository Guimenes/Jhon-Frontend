import React, { useState, memo, useEffect } from 'react';
import type { User } from '../../types';
import './styles.css';

interface UserAvatarProps {
  user: User;
  disableProfileModal?: boolean;
  onClick?: () => void;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = memo(({ 
  user, 
  disableProfileModal = false,
  onClick,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  const [avatarCacheKey, setAvatarCacheKey] = useState(() => Date.now());

  useEffect(() => {
    // Atualizar a cache key sempre que mudar o avatar do usuário
    if (user.avatar) {
      setImageError(false);
      setAvatarCacheKey(Date.now());
    }
  }, [user.avatar]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Adiciona um parâmetro à URL para evitar o cache do navegador
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
  const avatarUrl = user.avatar ? `${baseUrl}${user.avatar}?v=${avatarCacheKey}` : null;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (!disableProfileModal) {
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <>
      <div className={`user-avatar ${className}`} onClick={handleClick}>
        <div className="user-avatar-circle">
          {avatarUrl && !imageError ? (
            <img 
              src={avatarUrl} 
              alt={user.name} 
              crossOrigin="anonymous"
              loading="lazy"
              onError={handleImageError}
            />
          ) : (
            <span className="user-initials">{getInitials(user.name)}</span>
          )}
        </div>
      </div>
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.user._id === nextProps.user._id && 
         prevProps.user.avatar === nextProps.user.avatar &&
         prevProps.user.name === nextProps.user.name;
});

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;
