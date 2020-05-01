import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { GridConfiguration } from '../models/grid-configuration';
import { GridConfigurationService } from '../services/grid-configuration.service';
import { GridLocationConfigurationService } from '../services/grid-location-configuration.service';
import { GridDistributionWorkService } from '../services/grid-distribution-work.service';
import { GridDistributionWork } from '../models/grid-distribution-work';

enum CellStatus {
  OPEN = 'OPEN',
  RESERVED = 'RESERVED',
  IMPROCESS = 'IMPROCESS',
  COMPLETED = 'COMPLETED',
}
interface CellData {
  locationName: string;
  columnSpan: number;
  status: CellStatus;
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
      td.OPEN {
      }
      td.RESERVED {
        background-color: red;
      }
      td.IMPROCESS {
        background-color: green;
      }
      td.COMPLETED {
        background-color: grey;
      }

      .search-result-list {
        min-height: 200px;
        margin-top: 16px;
        padding-top: 10px;
        text-align: center;
        background-color: #fafafa;
        border: 1px solid #d9d9d9;
        border-radius: 6px;
      }
    `,
  ],
})
export class OutboundGridComponent implements OnInit {
  currentGridId: number;
  availableGrids: GridConfiguration[];
  inventoryId = '';
  locationGroupId: number;
  gridRows: RowData[];
  listOfDistributionWork: GridDistributionWork[] = [];
  itemName: string;

  @ViewChild('itemNameTextBox', { static: true }) itemNameTextBox: ElementRef;

  constructor(
    private http: _HttpClient,
    private gridConfigurationService: GridConfigurationService,
    private gridLocationConfigurationService: GridLocationConfigurationService,
    private gridDistributionWorkService: GridDistributionWorkService,
  ) {}

  ngOnInit() {
    // Let's get all grids defined in the system
    this.gridConfigurationService.getAll().subscribe(res => {
      this.availableGrids = res;
    });
  }

  gridChanged(locationGroupId: number) {
    this.gridRows = [];
    this.locationGroupId = locationGroupId;

    // Let's load all the grid location configurations
    this.gridLocationConfigurationService.getAll(locationGroupId).subscribe(gridLocationConfigurationList => {
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
          status: CellStatus.OPEN,
        });
      });

      if (currentRow.cells.length > 0) {
        // Save the last row
        this.gridRows.push(currentRow);
      }
    });
  }
  onUserInputInventoryIdEvent() {
    this.gridDistributionWorkService.get(this.locationGroupId, this.inventoryId).subscribe(gridDistributionWorks => {
      this.listOfDistributionWork = gridDistributionWorks;
      gridDistributionWorks.forEach(gridDistributionWork => {
        this.markCellAsInprocess(gridDistributionWork.gridLocationName);
      });
      this.itemNameTextBox.nativeElement.focus();
    });
  }
  gridCellClicked(locationName: string) {
    console.log(`gridCellClicked ${locationName}`);
  }

  markCellAsInprocess(gridLocationName: string) {
    this.gridRows.forEach(gridRow => {
      gridRow.cells.forEach(cell => {
        if (cell.locationName === gridLocationName) {
          cell.status = CellStatus.IMPROCESS;
        }
      });
    });
  }
  onUserInputItemNameEvent(itemName: string) {
    console.log(`itemName ${itemName}`);
  }
}
