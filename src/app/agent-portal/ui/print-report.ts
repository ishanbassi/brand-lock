/** Opens an isolated, print-ready document and waits for its images before showing the dialog. */
export async function printReport(html: string): Promise<void> {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.title = 'Printable report';
  Object.assign(frame.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
  document.body.appendChild(frame);

  const doc = frame.contentDocument;
  if (!doc) {
    frame.remove();
    throw new Error('Could not prepare the print document');
  }
  doc.open();
  doc.write(html);
  doc.close();

  const images = Array.from(doc.images);
  await Promise.all(images.map(image => image.complete ? Promise.resolve() : new Promise<void>(resolve => {
    image.addEventListener('load', () => resolve(), { once: true });
    image.addEventListener('error', () => resolve(), { once: true });
  })));

  window.setTimeout(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
  }, 50);
  frame.contentWindow?.addEventListener('afterprint', () => frame.remove(), { once: true });
}
