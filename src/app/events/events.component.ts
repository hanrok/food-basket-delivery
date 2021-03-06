import { Component, OnInit } from '@angular/core';
import { Context } from '@remult/core';
import { Event, volunteersInEvent } from './events';
import { ApplicationSettings } from '../manage/ApplicationSettings';
import { GridDialogComponent } from '../grid-dialog/grid-dialog.component';
import { HelperAssignmentComponent } from '../helper-assignment/helper-assignment.component';
import { Helpers } from '../helpers/helpers';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {

  constructor(private context: Context, private settings: ApplicationSettings) { }
  events = this.context.for(Event).gridSettings({
    allowUpdate: true,
    allowInsert: true,
    get: {
      limit: 25,
      orderBy: e => [e.eventStatus, e.eventDate, e.startTime]
    },
    
    numOfColumnsInGrid: 100,
    columnSettings: e => [
      e.name,
      e.eventStatus,
      e.eventDate,
      e.startTime,
      e.endTime,
      e.requiredVolunteers,
      e.registeredVolunteers,
      e.description
    ],
    rowButtons: [
      {
        name: this.settings.lang.volunteers,
        click: async e => {
          this.context.openDialog(GridDialogComponent, x => x.args = {
            title: e.name.value,
            settings: this.context.for(volunteersInEvent).gridSettings({
              get: {
                limit: 50,
                where: ve => ve.eventId.isEqualTo(e.id)
              },
              columnSettings: ev => [
                ev.helperName,
                ev.helperPhone,
                ev.assignedDeliveries
              ],
              rowButtons: [
                {
                  name: this.settings.lang.assignDeliveryMenu,
                  icon:'list_alt',
                  click: async (ev) => {
                    let h = await this.context.for(Helpers).findId(ev.helper);
                    await this.context.openDialog(HelperAssignmentComponent, x => x.argsHelper = h);
                    ev.save();
                  }
                }
              ]
            })
          });
        }
      }
    ]
  });
  ngOnInit() {
  }

}
