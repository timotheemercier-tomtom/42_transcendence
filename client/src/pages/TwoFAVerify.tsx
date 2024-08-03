
import { useState, FormEvent } from 'react';

export default function TwoFAVerify() {

  const [verificationCode, setVerificationCode] = useState(0);

  const handleVerificationSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log(verificationCode);
    // todo: actual verification
  };

  const verifcationOnChangeHandler = (event: FormEvent<HTMLInputElement>) => {
    if (event.currentTarget.value == '') {
      setVerificationCode(0);
    }
    else {
      setVerificationCode(event.currentTarget.valueAsNumber);
    }
  };

  return (
    <>
      <h2>Test User</h2>
      <form onSubmit={handleVerificationSubmit}>
        <label>
          VerificationCode:
          <input
            id='verifcation-code'
            type="number"
            value={verificationCode}
            onChange={verifcationOnChangeHandler}
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
