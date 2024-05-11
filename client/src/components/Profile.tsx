import React, { ChangeEvent, FormEvent, useState } from 'react';
import { API } from '../util';

interface IFormData {
  login: string;
  username: string;
  picture: string;
}

interface IFormErrors {
  username: string;
  picture: string;
}

interface FormWithValidationProps {
  initialFormData: IFormData;
  onImageUpdate: (newPicture: string) => void;
}

const FormWithValidation: React.FC<FormWithValidationProps> = ({
  initialFormData,
  onImageUpdate,
}) => {
  const [formData, setFormData] = useState<IFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<IFormErrors>({
    username: '',
    picture: '',
  });

  const validateForm = () => {
    return {
      username:
        formData.username === '' ? 'Le nom d’utilisateur est requis.' : '',
      picture: formData.picture === '' ? 'Une image est requise.' : '',
    };
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name !== 'login') {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (readEvent) => {
        const result = readEvent.target?.result;
        if (result) {
          setFormData((prevData) => ({
            ...prevData,
            picture: result as string,
          }));
          onImageUpdate(result as string);
        }
      };
      reader.onerror = () => {
        console.error('Error loading the file');
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.values(errors).every((error) => error === '')) {
      try {
        const response = await fetch(`${API}/user/${formData.login}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            picture: formData.picture,
          }),
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(
            `Échec de la mise à jour du profil : ${await response.text()}`,
          );
        }

        const updatedUser = await response.json();
        console.log('Profil mis à jour avec succès:', updatedUser);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Profile Picture:</label>
        <input type="file" name="picture" onChange={handleFileChange} />
        {formErrors.picture && (
          <span className="error">{formErrors.picture}</span>
        )}
      </div>
      <div>
        <label>Username:</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
        />
        {formErrors.username && (
          <span className="error">{formErrors.username}</span>
        )}
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default FormWithValidation;

//   {/* PICTURE URL */}
//   <label><p />
//           Or upload an URL:
//     <input
//       type="text"
//       name="picture"
//       value={formData.picture}
//       onChange={handleInputChange}
//     />
//     <span className="error">{formErrors.picture}</span>
//   </label>
