import { Avatar as MuiAvatar, CircularProgress } from '@mui/material';
import { green } from '@mui/material/colors';
import React, { useState } from 'react';

type AvatarProps = {
  username: string;
  picture: string;
  onUpdate: (newPictureUrl: string) => void;
};

const Picture: React.FC<AvatarProps> = ({ username, picture, onUpdate }) => {
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (readEvent) => {
        const base64Image = readEvent.target?.result;
        if (base64Image) {
          setUploading(true);
          try {
            await onUpdate(base64Image.toString());
          } catch (error) {
            console.error('Error updating the image', error);
          }
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {uploading ? (
        <CircularProgress />
      ) : (
        <MuiAvatar
          sx={{ bgcolor: green[500] }}
          alt={username}
          src={imageError ? undefined : picture}
          onError={() => setImageError(true)}
        >
          {imageError ? username.charAt(0) : ''}
        </MuiAvatar>
      )}
      <input type="file" onChange={handleFileChange} />
    </div>
  );
};

export default Picture;
