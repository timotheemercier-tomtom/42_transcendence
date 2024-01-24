import React, { useState, ChangeEvent, FormEvent } from 'react';
import { updateUserImage } from './User';

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
    onImageUpdate: (newPicture: string) => void; // Nouvelle prop pour la mise à jour de l'image
  }

const FormWithValidation: React.FC<FormWithValidationProps> = ({
  initialFormData, onImageUpdate,
}) => {
  const [formData, setFormData] = useState<IFormData>(initialFormData);
  const [file, setFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<IFormErrors>({
    username: '',
    picture: '',
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    // Update form data, but not the login
    if (name !== 'login') {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setFile(files[0]);
      // Conversion en Base64 (optionnel)
      const reader = new FileReader();
      reader.onload = (readEvent) => {
        if (readEvent.target) {
          setFormData({
            ...formData,
            picture: readEvent.target.result as string,
          });
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Initialize validation errors
    const validationErrors: IFormErrors = {
      username: formData.username === '' ? 'Username is required.' : '',
      picture: formData.picture === '' ? 'Picture is required.' : '',
    };

    setFormErrors(validationErrors);

    // Check if there are any validation errors
    const isFormValid = Object.values(validationErrors).every(
      (error) => error === '',
    );

    if (isFormValid) {
      try {
        const updatedUser = await updateUserImage(
          formData.login,
          formData.picture,
        );
        console.log('User updated successfully:', updatedUser);
        onImageUpdate(updatedUser.picture);
      } catch (error) {
        console.error('Error updating user:', error);
      }
    } else {
      console.log('Form validation failed. Please check the errors.');
    }
};

  return (
    <form onSubmit={handleSubmit}>
      Profile Picture:
      <input type="file" name="picture" onChange={handleFileChange} />
      <p />
      <label>
        Login:
        <input type="text" value={formData.login} readOnly />
      </label>
      <p />
      <label>
        <span className="error">{formErrors.picture}</span>
        <p />
        Username:
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
        />
        <span className="error">{formErrors.username}</span>
      </label>
      <p />
      <button type="submit">Submit</button>
      <p />
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
