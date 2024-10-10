import { Routes } from "@angular/router";
import { ServersComponent } from "./servers.component";
import { AuthGuardService } from "../../services/auth.guard.service";
import { CreateServerComponent } from "./create-server/create-server.component";
import { ServerDetailsComponent } from "./server-details/server-details.component";
import { ChannelComponent } from "./channel/channel.component";

export const SERVER_ROUTES: Routes = [
  { path: '', component: ServersComponent, canActivate: [AuthGuardService]},
  { path: 'create', component: CreateServerComponent, canActivate: [AuthGuardService] },
  { path: ':id', component: ServerDetailsComponent, canActivate: [AuthGuardService] },
  { path: ':id/channels/:channelId', component: ChannelComponent, canActivate: [AuthGuardService] },
];