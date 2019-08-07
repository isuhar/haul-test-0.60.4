import "./bootstrap"

import App from "./App"
import {configure} from "mobx"

configure({arrayBuffer: 100000})

void App()
