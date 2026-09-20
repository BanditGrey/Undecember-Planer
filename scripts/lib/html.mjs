// Minimal HTML -> text with block boundaries preserved as newlines.
export function htmlToLines(html) {
  let s = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, '');
  s = s.replace(/<\/(p|div|li|tr|td|th|h\d|section|article|ul|ol|dt|dd|span|a|b|strong|em|i)>/gi, '\n');
  s = s.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
  s = s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
  return s.split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
}
export function mainOf(html) {
  return html.match(/<main[\s\S]*?<\/main>/i)?.[0] || html.match(/<body[\s\S]*?<\/body>/i)?.[0] || html;
}
export function imgSrcs(html) { return [...html.matchAll(/<img[^>]+src="([^"]+)"/gi)].map(m => m[1]); }
export function links(html, re) { return [...new Set([...html.matchAll(/href="([^"]+)"/gi)].map(m => m[1]).filter(h => re.test(h)))]; }
