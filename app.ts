import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { v1 } from "https://deno.land/std@0.168.0/uuid/mod.ts"
import { z } from "https://deno.land/x/zod@v3.20.2/mod.ts";

const ZodMessage = z.object({
    name: z.string(),
    message: z.string()
})

type Message = z.infer<typeof ZodMessage>
const wsMap = new Map<string, WebSocket>()
const mssgList: Message[] = []

// Limit saved messages
setInterval(() => {
    if (mssgList.length > 5)
        mssgList.shift();
}, 5000)

const handleWebSocket = (request: Request): Response => {
    const { socket, response } = Deno.upgradeWebSocket(request);
    const uuid = v1.generate() as string

    socket.addEventListener("open", () => {
        console.log(`New socket connection ${uuid}! Connections: ${wsMap.size + 1}`)
        mssgList.forEach(mssg => {
            socket.send(JSON.stringify(mssg))
        })
        wsMap.set(uuid, socket)
    })

    socket.addEventListener("message", (event: MessageEvent) => {
        // Note `event.data` is a JSON string
        console.log(event.data);

        try {
            // Zod validation
            const parsedMessage = JSON.parse(event.data)
            ZodMessage.parse(parsedMessage)
            mssgList.push(parsedMessage)

            // Broadcasting message
            for (const [_, currSocket] of wsMap) {
                currSocket.send(event.data);
            }
        } catch (error) {
            // In case of a Zod or JSON.parse error
            console.error(error.message);
        }

    })

    socket.addEventListener("close", () => {
        const discMessage: Message = {
            name: "System",
            message: `User with id ${uuid} has disconnected`
        }

        console.log(`Disconnected ${uuid}!`)
        wsMap.delete(uuid)

        // Broadcasting disconnect message
        for (const [_, currSocket] of wsMap) {
            currSocket.send(JSON.stringify(discMessage));
        }

    })

    return response;
}

const routedResponse = async (pathname: string, request: Request): Promise<Response> => {
    switch (pathname) {
        // deno-lint-ignore no-case-declarations
        case "/":
            const body = await Deno.readTextFile("./public/index.html")
            return new Response(body, {
                status: 200,
                headers: { "Content-Type": "text/html" }
            })
        case "/ws":
            if (request.headers.get("upgrade") != "websocket")
                return new Response("400 Not a websocket request", { status: 400 })
            return handleWebSocket(request);
        default:
            return new Response("404 Not Found", { status: 404 })
    }
}

const handler = async (request: Request): Promise<Response> => {
    const url = request.url;
    const { pathname } = new URL(url);

    const response = await routedResponse(pathname, request);
    return response;
}

serve(handler, { port: 3000 })
console.log("http://localhost:3000/");
