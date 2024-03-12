import styles from './index.module.css';

export default function Initializer() {
  return (
    <script
      // so dramatic...
      dangerouslySetInnerHTML={{
        __html: `
          {
            const styleSheet = document.createElement('style');
            styleSheet.innerText = '.${styles.resize} { opacity: 0; }';
            document.head.appendChild(styleSheet);
          }
        `,
      }}
    />
  );
}
