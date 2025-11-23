// import { useState, useEffect } from "react";
// import { StreamChat } from "stream-chat";
// import toast from "react-hot-toast";
// import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
// import { sessionApi } from "../api/sessions";

// function useStreamClient(session, loadingSession, isHost, isParticipant) {
//   const [streamClient, setStreamClient] = useState(null);
//   const [call, setCall] = useState(null);
//   const [chatClient, setChatClient] = useState(null);
//   const [channel, setChannel] = useState(null);
//   const [isInitializingCall, setIsInitializingCall] = useState(true);

//   useEffect(() => {
//     let videoCall = null;
//     let chatClientInstance = null;

//     const initCall = async () => {
//       if (!session?.callId) return;
//       if (!isHost && !isParticipant) return;
//       if (session.status === "completed") return;

//       try {
//         const { token, userId, userName, userImage } = await sessionApi.getStreamToken();

//         const client = await initializeStreamClient(
//           {
//             id: userId,
//             name: userName,
//             image: userImage,
//           },
//           token
//         );

//         setStreamClient(client);

//         // videoCall = client.call("default", session.callId);
//         // await videoCall.join({ create: isHost });
//         // setCall(videoCall);

//         videoCall = client.call("default", session.callId);

//         if (isHost) {
//           await videoCall.join({ create: true });
//         } else {
//           // ensure call is created by host
//           try {
//             await videoCall.get();
//           } catch (e) {
//             console.log("Call not ready yet, waiting...");
//             await new Promise(r => setTimeout(r, 800));
//             await videoCall.get();
//           }

//           await videoCall.join({ create: false });
//         }

//         setCall(videoCall);



//         const apiKey = import.meta.env.VITE_STREAM_API_KEY;
//         chatClientInstance = StreamChat.getInstance(apiKey);

//         await chatClientInstance.connectUser(
//           {
//             id: userId,
//             name: userName,
//             image: userImage,
//           },
//           token
//         );
//         setChatClient(chatClientInstance);

//         const chatChannel = chatClientInstance.channel("messaging", session.callId);
//         await chatChannel.watch();
//         setChannel(chatChannel);
//       } catch (error) {
//         toast.error("Failed to join video call");
//         console.error("Error init call", error);
//       } finally {
//         setIsInitializingCall(false);
//       }
//     };

//     if (session && !loadingSession) initCall();

//     // cleanup - performance reasons
//     // return () => {
//     //   // iife
//     //   (async () => {
//     //     try {
//     //       if (videoCall) await videoCall.leave();
//     //       if (chatClientInstance) await chatClientInstance.disconnectUser();
//     //       await disconnectStreamClient();
//     //     } catch (error) {
//     //       console.error("Cleanup error:", error);
//     //     }
//     //   })();
//     // };


//     return () => {
//       (async () => {
//         try {
//           if (videoCall) {
//             await videoCall.leave();
//             await videoCall.endCall(); // removes ghost session
//           }

//           if (chatClientInstance) {
//             await chatClientInstance.disconnectUser();
//           }

//           await disconnectStreamClient();
//         } catch (error) {
//           console.error("Cleanup error:", error);
//         }
//       })();
//     };

//   }, [session, loadingSession, isHost, isParticipant]);

//   return {
//     streamClient,
//     call,
//     chatClient,
//     channel,
//     isInitializingCall,
//   };
// }

// export default useStreamClient;





import { useState, useEffect, useRef } from "react";
import { StreamChat } from "stream-chat";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  // prevent multiple joins
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!session?.callId) return;
    if (!isHost && !isParticipant) return;
    if (session.status === "completed") return;
    if (hasJoinedRef.current) return;   // ❗ avoid duplicate join()

    hasJoinedRef.current = true;

    let videoCall = null;
    let chatClientInstance = null;

    const initCall = async () => {
      try {
        const { token, userId, userName, userImage } = await sessionApi.getStreamToken();

        const client = await initializeStreamClient(
          { id: userId, name: userName, image: userImage },
          token
        );
        setStreamClient(client);

        videoCall = client.call("default", session.callId);

        // Host creates the call
        if (isHost) {
          await videoCall.join({ create: true });
        } else {
          await videoCall.join(); // participant joins existing call
        }

        setCall(videoCall);

        // CHAT
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          { id: userId, name: userName, image: userImage },
          token
        );
        setChatClient(chatClientInstance);

        const chatChannel = chatClientInstance.channel("messaging", session.callId);
        await chatChannel.watch();
        setChannel(chatChannel);

      } catch (error) {
        console.error("Error joining call:", error);
      } finally {
        setIsInitializingCall(false);
      }
    };

    initCall();

    return () => {
      (async () => {
        try {
          if (videoCall) {
            await videoCall.leave();  // only leave
          }

          if (chatClientInstance) {
            await chatClientInstance.disconnectUser();
          }

          await disconnectStreamClient();
        } catch (e) {
          console.error("Cleanup error:", e);
        }
      })();
    };

  }, [session, loadingSession, isHost, isParticipant]);

  return { streamClient, call, chatClient, channel, isInitializingCall };
}

export default useStreamClient;
