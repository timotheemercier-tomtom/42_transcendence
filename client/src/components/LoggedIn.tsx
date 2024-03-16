import { FC, useEffect, useState } from "react"
import { BsFillCheckCircleFill } from "react-icons/bs"
import Lottie from "lottie-react";
import confetti from "../assets/confetti.json"

import styles from "./index.module.scss"

export const useSession = () => {
  const [ session, setSession ] = useState<any>(null)

  useEffect(() => {
    // Get the session data from your session storage or API
    const storedSession = sessionStorage.getItem("session")
    if (storedSession) {
      setSession(JSON.parse(storedSession))
    }
    return () => {
      sessionStorage.removeItem("session")
    }
  }, [])

  const logOut = () => {
    setSession(null)
    sessionStorage.removeItem("session")
  }
  return [session, setSession]
}


const [session, setSession, logOut] = useSession()

  export const SignedIn: React.FC = () => {
  return (
    <div className={styles.signedin_container}>
      <div className={styles.signedin_content}>
        <BsFillCheckCircleFill />
        <p>
          You&apos;re signed in
          <br />
          as {session?.user?.name}
        </p>
      </div>
      <button onClick={() => logOut()} className={styles.btn_signout}>
        Sign out
      </button>
      <div className={styles.lottie_container}>
        <Lottie animationData={confetti} loop={false} />
      </div>
    </div>
  )
};