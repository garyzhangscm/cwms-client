import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { GridConfiguration } from '../models/grid-configuration';
import { GridConfigurationService } from '../services/grid-configuration.service';
import { GridLocationConfigurationService } from '../services/grid-location-configuration.service';

interface CellData {
  locationName: string;
  columnSpan: number;
}
interface RowData {
  cells: CellData[];
}

@Component({
  selector: 'app-outbound-grid',
  templateUrl: './grid.component.html',
  styles: [
    `
      .query-form {
        max-width: 300px;
      }
      table {
        width: 100%;
      }
      table,
      th,
      td {
        border: 1px solid black;
        text-align: center;
        cursor: pointer;
      }
      td div {
        width: 100%;
        height: 100%;
        padding-top: 20px;
        padding-bottom: 20px;
      }
    `,
  ],
})
export class OutboundGridComponent implements OnInit {
  currentGridId: number;
  availableGrids: GridConfiguration[];
  inventoryId = '';
  gridRows: RowData[];

  constructor(
    private http: _HttpClient,
    private gridConfigurationService: GridConfigurationService,
    private gridLocationConfigurationService: GridLocationConfigurationService,
  ) {}

  ngOnInit() {
    // Let's get all grids defined in the system
    this.gridConfigurationService.getAll().subscribe(res => {
      this.availableGrids = res;
      console.log(`grid configuration loaded!`);
    });
  }

  gridChanged(locationGroupId: number) {
    console.log(`Grid is changed to ${locationGroupId}`);
    this.gridRows = [];

    // Let's load all the grid location configurations
    this.gridLocationConfigurationService.getAll(locationGroupId).subscribe(gridLocationConfigurationList => {
      console.log(`Get grid locations: \n ${JSON.stringify(gridLocationConfigurationList)}`);
      let currentRowNumber = -1;
      let currentRow: RowData = {
        cells: [],
      };
      gridLocationConfigurationList.forEach(gridLocationConfiguration => {
        if (currentRowNumber !== gridLocationConfiguration.rowNumber) {
          if (currentRow.cells.length > 0) {
            // Save the last row
            this.gridRows.push(currentRow);
          }
          // Let's start a new row
          currentRow = {
            cells: [],
          };
          currentRowNumber = gridLocationConfiguration.rowNumber;
        }
        currentRow.cells.push({
          locationName: gridLocationConfiguration.location.name,
          columnSpan: gridLocationConfiguration.columnSpan,
        });
      });

      if (currentRow.cells.length > 0) {
        // Save the last row
        this.gridRows.push(currentRow);
      }
      console.log(`After process, we get data\n ${JSON.stringify(this.gridRows)}`);
    });
  }
  onUserInputInventoryIdEvent() {
    console.log(`inventoryId is changed to ${this.inventoryId}`);
  }
  gridCellClicked(locationName: string) {
    console.log(`gridCellClicked ${locationName}`);
  }
}
