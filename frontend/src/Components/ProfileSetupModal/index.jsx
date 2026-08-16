import React from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { closeProfilePrompt } from "../../config/redux/reducer/authReducer";
import styles from "./styles.module.css";

export default function ProfilePrompt() {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleCompleteProfile = () => {
    dispatch(closeProfilePrompt());
    router.push("/profile");
  };

  const handleDismiss = () => {
    dispatch(closeProfilePrompt());
  };

  return (
    <div className={styles.promptBanner}>
      <div className={styles.content}>
        <p>
          <strong>Complete your profile:</strong> Add your bio and details so
          connections can find you!
        </p>
      </div>
      <div className={styles.actions}>
        <button onClick={handleCompleteProfile} className={styles.primaryBtn}>
          Go to Profile
        </button>
        <button onClick={handleDismiss} className={styles.dismissBtn}>
          ✕
        </button>
      </div>
    </div>
  );
}
