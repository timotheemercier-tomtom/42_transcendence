import { useState, FormEvent } from 'react';
import { API } from '../util';
import { useParams } from 'react-router-dom';

export default function TwoFAVerify() {
  const [twoFAToken, setTwoFAToken] = useState('');
  const { login } = useParams<{ login: string }>();

  const handleVerificationSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const res = await fetch(`${API}/auth/${login}/${twoFAToken}/2fa/verify`, {
      method: 'POST',
      credentials: 'include',
    });
    const redir_url = await res.text();
    if (redir_url !== '') {
      location.href = redir_url;
    } else {
      alert('Wrong code!');
    }
  };

  const verifcationOnChangeHandler = (event: FormEvent<HTMLInputElement>) => {
    setTwoFAToken(event.currentTarget.value);
  };

  return (
    <>
      <h2>2FA Verification Code for user {login}</h2>
      <form onSubmit={handleVerificationSubmit}>
        <label>
          Verification Code:
          <input
            id="verification-code"
            type="number"
            value={twoFAToken}
            onChange={verifcationOnChangeHandler}
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
