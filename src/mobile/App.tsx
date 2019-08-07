import {InteractionManager} from "react-native"

export default function App() {
    InteractionManager.runAfterInteractions(() => {
        alert("Alert!")
        setTimeout(() => {
            alert("Alert after timeout")
        }, 1000)
    });
}
