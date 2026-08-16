import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import {
  loginUser,
  registerUser,
} from "@/config/redux/action/authAction/index.js";
import { showToast } from "@/config/redux/reducer/toastReducer";
import styles from "./styles.module.css";
import ProfileSetupModal from "@/Components/ProfileSetupModal/index.jsx";

const SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    badge: "Smart Networking",
    featureTitle: "AI-Powered Connections",
    featureDesc:
      "Match with professionals based on mutual skills and shared interests.",
    stats: "+5,000 New matches daily",
  },
  {
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80",
    badge: "Team Collaboration",
    featureTitle: "Seamless Team Building",
    featureDesc:
      "Discover talented co-founders, advisors, and team members globally.",
    stats: "Over 1,200 active teams",
  },
  {
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    badge: "Career Advancement",
    featureTitle: "Verified Industry Mentors",
    featureDesc:
      "Get 1-on-1 guidance from seniors and hiring managers in your field.",
    stats: "94% career growth rate",
  },
];

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const { showProfilePrompt } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const res = await dispatch(
        registerUser({
          name: fullName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      );
      if (registerUser.fulfilled.match(res)) {
        dispatch(
          showToast({
            message: "Account created! Please sign in.",
            type: "success",
          }),
        );
        setIsSignUp(false);
      } else {
        dispatch(
          showToast({
            message: res.payload?.message || "Registration failed",
            type: "error",
          }),
        );
      }
    } else {
      const res = await dispatch(
        loginUser({
          email: formData.email,
          password: formData.password,
        }),
      );
      if (loginUser.fulfilled.match(res)) {
        dispatch(showToast({ message: "Welcome back!", type: "success" }));
        router.push("/dashboard");
      } else {
        dispatch(
          showToast({
            message: res.payload?.message || "Invalid credentials",
            type: "error",
          }),
        );
      }
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authCard}>
        {/* ── Left Form Side ── */}
        <div className={styles.formSection}>
          <div className={styles.brandHeader}>
            <img
              src="/images/prconnect.png"
              alt="ProConnect Logo"
              className={styles.brandLogoImg}
            />
          </div>

          <div className={styles.formContentScrollable}>
            <div className={styles.formContainer}>
              <h2>{isSignUp ? "Create account" : "Sign In"}</h2>
              <p className={styles.subtext}>
                {isSignUp
                  ? "Join our professional community today"
                  : "Welcome back! Please enter your details"}
              </p>

              <form onSubmit={handleSubmit} className={styles.form}>
                {isSignUp && (
                  <>
                    {/* Side-by-Side Name Inputs to solve height budget */}
                    <div className={styles.rowTwoCol}>
                      <div className={styles.inputGroup}>
                        <label>First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          placeholder="Amélie"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          placeholder="Laurent"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Username</label>
                      <input
                        type="text"
                        name="username"
                        placeholder="amelie_l"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </>
                )}

                <div className={styles.inputGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Password</label>
                  <div className={styles.passwordWrapper}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeToggle}
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className={styles.iconSvg}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className={styles.iconSvg}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12c1.341-4.55 5.51-7.5 9.964-7.5s8.623 2.95 9.964 7.5c-1.341 4.55-5.51 7.5-9.964 7.5s-8.623-2.95-9.964-7.5z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn}>
                  {isSignUp ? "Create Account" : "Sign In"}
                </button>
              </form>

              <p className={styles.switchAuthText}>
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  className={styles.switchBtn}
                  onClick={() => setIsSignUp((prev) => !prev)}
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
          </div>

          <div className={styles.formFooter}>
            <span className={styles.legalText}>© 2026 ProConnect Inc.</span>
            <span className={styles.legalText}>Terms & Conditions</span>
          </div>
        </div>

        {/* ── Right Slideshow Side ── */}
        <div className={styles.slideshowSection}>
          {SLIDES.map((slide, idx) => (
            <div
              key={idx}
              className={`${styles.slide} ${
                activeSlide === idx ? styles.activeSlide : ""
              }`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className={styles.slideOverlay} />

              {/* Dynamic Feature Card Top */}
              <div className={styles.glassCardTop}>
                <span className={styles.badge}>{slide.badge}</span>
                <p className={styles.featureTitle}>{slide.featureTitle}</p>
                <small className={styles.featureDesc}>
                  {slide.featureDesc}
                </small>
              </div>

              {/* Dynamic Bottom Card */}
              <div className={styles.glassCardBottom}>
                <div className={styles.statsRow}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={styles.sparkleIcon}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                    />
                  </svg>
                  <span>{slide.stats}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Indicators */}
          <div className={styles.indicatorContainer}>
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                className={`${styles.dot} ${
                  activeSlide === idx ? styles.activeDot : ""
                }`}
                onClick={() => setActiveSlide(idx)}
              />
            ))}
          </div>
        </div>
      </div>
      {showProfilePrompt && <ProfileSetupModal />}
    </div>
  );
}
