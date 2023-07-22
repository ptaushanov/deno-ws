# 🌐 Create vanilla Deno WS Server 🌐

This is a simple example of a vanilla Deno WebSocket server template. It's a
simple chat server that broadcasts messages to all connected clients.

---

### 📦 Dependencies 📦

Deno v1.35.X or higher

### 🚀 Run the server 🚀

```bash
deno run --allow-net --allow-read app.ts
```

or run it from a URL

```bash
deno run --allow-net --allow-read https://raw.githubusercontent.com/ptaushanov/deno-ws/master/app.ts
```

---

**Note:**

Running the server from a URL will not download the public folder and the server
will not be able to serve the static files.

---

### 📝 License

This project is licensed under the MIT License - _see the_
[LICENSE.md](https://github.com/ptaushanov/festify/blob/master/LICENSE) _file
for details._
