import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <div>
          <Image src="https://storage.googleapis.com/coderpad_project_template_assets/coderpad_logo.svg" alt="CodePad Logo" />
        </div>
        <div>
          <Image src="/next-typography.svg" alt="Nextjs Logo" width={100} height={24} priority />
        </div>
      </div>
      <div className={styles.content}>
        <Image src="/next.svg" alt="Next.js Logo" width={180} height={37} priority />
        <p>Hello Next.js!</p>
      </div>
      <div className={styles.footer}>Use the Shell to install new packages.</div>
    </div>
  );
}
