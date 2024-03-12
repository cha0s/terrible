import styles from './number.module.css';

export default function Initializer() {
  return (
    <script
      // so dramatic...
      dangerouslySetInnerHTML={{
        __html: `
          {
            const styleSheet = document.createElement('style');
            styleSheet.innerText = [
              '.${styles.rendered} {display: inline !important}',
              '.${styles.streamed} {display: none !important}',
            ].join('');
            document.head.appendChild(styleSheet);
          }
        `,
      }}
    />
  );
}
