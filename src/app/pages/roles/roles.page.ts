import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Partnership } from 'src/app/models/partnership.model';
import { ChatService } from '../../object-init/chat.service';
import { ChattService } from '../../services/chatt.service';
import { IonicComponentService } from '../../services/ionic-component.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.page.html',
  styleUrls: ['./roles.page.scss'],
})
export class RolesPage implements OnInit {

  partnership: Partnership;
  role: string = "";
  uid: string = "";
  sent: boolean = false;
  constructor(
    private activated_route: ActivatedRoute,
    private router: Router,
    private chat_init_svc: ChatService,
    private chat_svc: ChattService,
    private modal_controller: ModalController,
    private ionic_component_svc: IonicComponentService
  ) { 
    this.partnership = this.chat_init_svc.defaultPartnership();
    this.role= this.activated_route.snapshot.paramMap.get("role");
    this.uid = this.activated_route.snapshot.paramMap.get("uid");
  }

  ngOnInit() {
    this.partnership.role = this.role;
    this.partnership.uid = this.uid;
    console.log(this.partnership);
  }

  async close(){
    await this.modal_controller.dismiss();
  }

  submit(){
    this.partnership.time = Date.now();
    this.ionic_component_svc.presentLoading();
    this.chat_svc.createPartnership(this.partnership)
    .then(ref =>{
      this.partnership.id = ref.id;
      this.chat_svc.updatePartnership(this.partnership)
      .then(() =>{
        this.sent = true;
        this.ionic_component_svc.dismissLoading()
        .catch(err =>{
          console.log(err)
        })
      })
      .catch(err =>{
        console.log(err)
        this.ionic_component_svc.dismissLoading()
        .catch(err =>{
          console.log(err)
        })
      })
    })
    .catch(err =>{
      console.log(err)
      this.ionic_component_svc.dismissLoading()
      .catch(err =>{
        console.log(err)
      })
    })
  }

}
