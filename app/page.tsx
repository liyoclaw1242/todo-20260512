/**
 * Renders the main todo page HTML.
 *
 * Pure function — no side effects, no I/O. Takes the list of all todos and
 * returns a complete HTML document string ready to be sent as text/html.
 *
 * The page embeds a <input type="search"> and inline script so the browser
 * can filter the visible list in real-time (no page reload, no Enter press)
 * satisfying AC#1–AC#5 of WP #7.
 */
export interface TodoItem {
  id: string;
  title: string;
}

export function renderPage(todos: TodoItem[]): string {
  const itemsJson = JSON.stringify(todos);
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todos</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
    #search { width: 100%; padding: 0.5rem; font-size: 1rem; box-sizing: border-box; }
    ul { list-style: none; padding: 0; margin-top: 1rem; }
    li { padding: 0.4rem 0; border-bottom: 1px solid #eee; }
    li[hidden] { display: none; }
  </style>
</head>
<body>
  <h1>Todos</h1>
  <input id="search" type="search" placeholder="Search todos…" autocomplete="off" aria-label="Search todos">
  <ul id="todo-list">
    ${todos.map((t) => `<li data-title="${escapeAttr(t.title)}">${escapeHtml(t.title)}</li>`).join("\n    ")}
  </ul>
  <script>
    var todos = ${itemsJson};
    var input = document.getElementById('search');
    var list = document.getElementById('todo-list');
    function renderList(q) {
      var items = list.querySelectorAll('li');
      var lower = q.toLowerCase();
      items.forEach(function(li) {
        var title = li.getAttribute('data-title') || '';
        if (lower === '' || title.toLowerCase().indexOf(lower) !== -1) {
          li.removeAttribute('hidden');
        } else {
          li.setAttribute('hidden', '');
        }
      });
    }
    input.addEventListener('input', function() { renderList(input.value); });
  </script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
