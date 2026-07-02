import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import UserLayout from "@/layouts";

export default function Home() {
  const router = useRouter();

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <div className={styles.mainContainer_left}>
            <p>Connect with professionals.</p>
            <p>Grow your network, grow your career.</p>
            <p>Discover opportunities built for you.</p>
            <div className={styles.buttonJoin}>
              <button onClick={() => router.push("/login")}>Get Started</button>
            </div>
          </div>
          <div className={styles.mainContainer_right}>
            <img src="/images/homeConnect.png" />
          </div>
        </div>
        {/* ── Social proof ───────────────────────── */}
        <div className={styles.proofStrip}>
          <div className={styles.avatarStack}>
            {["N", "S", "A", "R", "M"].map((letter, i) => (
              <div
                key={i}
                className={styles.avatar}
                style={{
                  background: [
                    "#0a66c2",
                    "#74ad0d",
                    "#f59e0b",
                    "#8b5cf6",
                    "#ef4444",
                  ][i],
                }}
              >
                {letter}
              </div>
            ))}
          </div>
          <p>
            Join <strong>500+ professionals</strong> already building their
            network on ProConnect.
          </p>
        </div>

        {/* ── How it works ───────────────────────── */}
        <div className={styles.howSection}>
          <p className={styles.sectionEyebrow}>How it works</p>
          <h2 className={styles.sectionTitle}>Up and running in three steps</h2>
          <div className={styles.stepsRow}>
            {[
              {
                step: "01",
                title: "Build your profile",
                desc: "Add your experience, education, and a bio that tells your story.",
              },
              {
                step: "02",
                title: "Connect with people",
                desc: "Send connection requests to peers, mentors, and hiring managers.",
              },
              {
                step: "03",
                title: "Find opportunities",
                desc: "Discover posts, referrals, and roles from your network.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className={styles.stepCard}>
                <span className={styles.stepNumber}>{step}</span>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Feature highlights ──────────────────── */}
        <div className={styles.featuresSection}>
          <p className={styles.sectionEyebrow}>What you get</p>
          <h2 className={styles.sectionTitle}>
            Everything you need to grow professionally
          </h2>
          <div className={styles.featuresGrid}>
            {[
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ),
                title: "Posts & Activity",
                desc: "Share updates, articles, and milestones. Stay visible to your network.",
                accent: "#0a66c2",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
                  </svg>
                ),
                title: "Connection Requests",
                desc: "Grow your network intentionally. Every connection is a door to something new.",
                accent: "#74ad0d",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ),
                title: "Discover People",
                desc: "Browse professionals across industries. Find the right people at the right time.",
                accent: "#8b5cf6",
              },
            ].map(({ icon, title, desc, accent }) => (
              <div key={title} className={styles.featureCard}>
                <div
                  className={styles.featureIcon}
                  style={{ color: accent, background: `${accent}15` }}
                >
                  {icon}
                </div>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ──────────────────────────── */}
        <div className={styles.ctaBanner}>
          <h2 className={styles.ctaTitle}>
            Your next opportunity starts with one connection.
          </h2>
          <p className={styles.ctaSub}>
            Free to join. Takes less than a minute.
          </p>
          <button
            className={styles.ctaButton}
            onClick={() => router.push("/login")}
          >
            Create your profile
          </button>
        </div>
      </div>
    </UserLayout>
  );
}
