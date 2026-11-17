import { HostSheet } from "./components/HostSheet"
import { InviteSheet } from "./components/InviteSheet"
import { PhoneFrame } from "./components/PhoneFrame"
import { ExploreScreen } from "./screens/ExploreScreen"
import { GameDetailScreen } from "./screens/GameDetailScreen"
import { GamesScreen } from "./screens/GamesScreen"
import { LobbyScreen } from "./screens/LobbyScreen"
import { ProfileScreen } from "./screens/ProfileScreen"
import { useApp } from "./state/AppState"
export default function App() {
  const app = useApp()
  let screen = <ExploreScreen />
  if (app.openGameId) screen = <GameDetailScreen />
  else if (app.tab === "lobby") screen = <LobbyScreen />
  else if (app.tab === "games") screen = <GamesScreen />
  else if (app.tab === "profile") screen = <ProfileScreen />
  return (
    <PhoneFrame
      overlay={
        <>
          {app.hostOpen && <HostSheet />}
          {app.inviteOpen && <InviteSheet />}
        </>
      }
    >
      {screen}
    </PhoneFrame>
  )
}