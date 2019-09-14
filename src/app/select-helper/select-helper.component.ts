import { Component, OnInit, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Helpers, HelpersBase } from '../helpers/helpers';
import { Context } from 'radweb';
import { FilterBase, FindOptionsPerEntity } from 'radweb';

import { BusyService } from 'radweb';
import { ApplicationSettings } from '../manage/ApplicationSettings';
import { HelpersAndStats } from '../delivery-follow-up/HelpersAndStats';

@Component({
  selector: 'app-select-helper',
  templateUrl: './select-helper.component.html',
  styleUrls: ['./select-helper.component.scss']
})
export class SelectHelperComponent implements OnInit {

  searchString: string = '';
  lastFilter: string = undefined;

  filteredHelpers: HelpersBase[] = [];
  constructor(
    private dialogRef: MatDialogRef<SelectHelperComponent>,
    @Inject(MAT_DIALOG_DATA) private data: SelectHelperInfo,
    private context: Context,
    private busy: BusyService

  ) {

  }
  clearHelper() {
    this.select(undefined);
  }


  findOptions = {
    orderBy: h => [h.name], limit: 25
  } as FindOptionsPerEntity<HelpersAndStats>;
  async ngOnInit() {


    this.findOptions.where = h => {
      let r = h.name.isContains(this.searchString);
      if (this.data.filter) {
        return r.and(this.data.filter(h));
      }
      return r;
    };

    if (Helpers.recentHelpers.length == 0 || this.data.hideRecent)
      this.getHelpers();
    else {
      this.filteredHelpers = [...Helpers.recentHelpers];
      this.showingRecentHelpers = true;
    }

  }
  showingRecentHelpers = false;
  moreHelpers() {
    this.findOptions.limit *= 2;
    this.getHelpers();
  }
  async getHelpers() {

    await this.busy.donotWait(async () => {
      this.filteredHelpers = await this.context.for(HelpersAndStats).find(this.findOptions);
      this.showingRecentHelpers = false;
    });

  }
  doFilter() {
    if (this.searchString.trim() != this.lastFilter) {
      this.lastFilter = this.searchString.trim();
      this.getHelpers();
    }

  }
  showCompany() {
    return ApplicationSettings.get(this.context).showCompanies.value;
  }
  selectFirst() {
    if (this.filteredHelpers.length > 0)
      this.select(this.filteredHelpers[0]);
  }
  select(h: HelpersBase) {
    this.data.onSelect(h);
    if (h && !h.isNew())
      Helpers.addToRecent(h);
    this.dialogRef.close();
  }
  static dialog(dialog: MatDialog, options: SelectHelperInfo) {

    dialog.open(SelectHelperComponent, {
      data: options
    });
  }

}
export interface SelectHelperInfo {
  hideRecent?: boolean,
  onSelect: (selectedValue: HelpersBase) => void,
  filter?: (helper: HelpersAndStats) => FilterBase

}