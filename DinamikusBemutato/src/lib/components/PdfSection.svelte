<script lang="ts">
  type Props = {
    file: string;       
    fromPage: number;
    toPage: number;
    title?: string;
  };

  let {
    file,
    fromPage,
    toPage,
    title = `PDF részlet: ${file} (${fromPage}–${toPage}. oldal)`
  }: Props = $props();

  const src = file.startsWith('/')
    ? `${file}#page=${fromPage}`
    : `/${file}#page=${fromPage}`;
</script>

<div class="pdf-section">
  <div class="info">
    <strong>Kapcsolódó diasor:</strong>
    <span>{file}, {fromPage}–{toPage}. dia</span>
    <a href={src} target="_blank" rel="noreferrer">
      Megnyitás PDF-ben
    </a>
  </div>

  <iframe
    src={src}
    class="pdf-frame"
    title={title}
  ></iframe>
</div>

<style>
  .pdf-section {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .info {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: baseline;
    font-size: 0.9rem;
  }

  .info a {
    text-decoration: none;
    padding: 0.25rem 0.6rem;
    border-radius: 0.6rem;
    border: 1px solid rgba(0,0,0,0.12);
    background: rgba(0,0,0,0.02);
  }

  .pdf-frame {
    width: 100%;
    height: 480px;
    border: 1px solid rgba(0,0,0,0.12);
    border-radius: 0.75rem;
  }
</style>
