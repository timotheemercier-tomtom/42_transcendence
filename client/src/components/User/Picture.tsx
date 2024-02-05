import React, { useState, ChangeEvent } from 'react';
import { Avatar as MuiAvatar } from '@mui/material';
import { green } from '@mui/material/colors';

type AvatarProps = {
  username: string;
  picture: string;
  onUpdate: (newPictureUrl: string) => void; // Callback pour mettre à jour l'URL de l'image dans le composant parent
};

const Picture: React.FC<AvatarProps> = ({ username, picture, onUpdate }) => {
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readEvent) => {
        // Ajout d'une vérification pour s'assurer que readEvent.target n'est pas null
        if (readEvent.target) {
          const base64Image = readEvent.target.result;
          // send the 64 chain to the server
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
        
      <MuiAvatar
        sx={{ bgcolor: green[500] }}
        alt={username}
        src={imageError ? undefined : picture}
        onError={() => setImageError(true)}
      >
        {imageError ? username.charAt(0) : ''}
      </MuiAvatar>

    </div>
    
  );
};

export default Picture;
