import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { GridConfiguration } from '../models/grid-configuration';
import { GridConfigurationService } from '../services/grid-configuration.service';
import { GridLocationConfigurationService } from '../services/grid-location-configuration.service';
import { GridDistributionWorkService } from '../services/grid-distribution-work.service';
import { GridDistributionWork } from '../models/grid-distribution-work';
import { FormGroup, FormBuilder } from '@angular/forms';

enum CellStatus {
  OPEN = 'OPEN',
  RESERVED = 'RESERVED',
  IMPROCESS = 'IMPROCESS',
  COMPLETED = 'COMPLETED',
}
interface CellData {
  gridLocationConfigurationId: number;
  locationName: string;
  columnSpan: number;
  status: CellStatus;
  progress: number;
  pendingQuantity: number;
  arrivedQuantity: number;
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
      td .grid-cell {
        width: 100%;
        height: 100%;
        padding-top: 20px;
        padding-bottom: 20px;
      }
      td .grid-cell-inv {
        text-align: right;
      }
      td .grid-cell-inv .badge {
        padding-right: 5px;
        padding-top: 10px;
        color: blue;
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
  availableGrids: GridConfiguration[];
  gridRows: RowData[];
  listOfDistributionWork: GridDistributionWork[] = [];

  gridQueryForm: FormGroup;
  showDistributionWork = false;
  refresh = true;
  gridDisplaySpan = 24;

  @ViewChild('itemNameTextBox', { static: true }) itemNameTextBox: ElementRef;

  constructor(
    private fb: FormBuilder,
    private gridConfigurationService: GridConfigurationService,
    private gridLocationConfigurationService: GridLocationConfigurationService,
    private gridDistributionWorkService: GridDistributionWorkService,
  ) {}

  ngOnInit() {
    // Let's get all grids defined in the system
    this.gridConfigurationService.getAll().subscribe(res => {
      this.availableGrids = res;
    });
    this.gridQueryForm = this.fb.group({
      locationGroupId: [null],
      inventoryId: [null],
      itemName: [null],
    });
  }

  gridChanged(locationGroupId: number) {
    this.gridRows = [];
    this.gridQueryForm.controls.inventoryId.reset();

    this.listOfDistributionWork = [];

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
          gridLocationConfigurationId: gridLocationConfiguration.id,
          locationName: gridLocationConfiguration.location.name,
          columnSpan: gridLocationConfiguration.columnSpan,
          status: CellStatus.OPEN,
          progress: (gridLocationConfiguration.arrivedQuantity * 100) / gridLocationConfiguration.pendingQuantity,
          pendingQuantity: gridLocationConfiguration.pendingQuantity,
          arrivedQuantity: gridLocationConfiguration.arrivedQuantity,
        });
      });

      if (currentRow.cells.length > 0) {
        // Save the last row
        this.gridRows.push(currentRow);
      }
    });
  }
  onUserInputInventoryIdEvent() {
    this.gridDistributionWorkService
      .get(this.gridQueryForm.controls.locationGroupId.value, this.gridQueryForm.controls.inventoryId.value)
      .subscribe(gridDistributionWorks => {
        this.listOfDistributionWork = gridDistributionWorks;
        gridDistributionWorks.forEach(gridDistributionWork => {
          this.markCellAsInprocess(gridDistributionWork.gridLocationName);
        });
        this.itemNameTextBox.nativeElement.focus();
      });
  }
  // Click the grid cell to confirm by the inventory group id(LPN / Pick List Number / Carton Number / etc)
  gridCellClicked(gridLocationConfigurationId: number) {
    console.log(
      `start to confirm with gridCellClicked: ${gridLocationConfigurationId} and inventoryId: ${this.gridQueryForm.controls.inventoryId.value}`,
    );
    console.log(`this.itemNameTextBox.nativeElement.value: ${this.itemNameTextBox.nativeElement.value}`);
    this.gridDistributionWorkService
      .confirm(gridLocationConfigurationId, this.gridQueryForm.controls.inventoryId.value)
      .subscribe(res => {
        console.log(`cell confirmed ${JSON.stringify(res)}`);
        // reload the grid information after confirm
        this.gridChanged(this.gridQueryForm.controls.locationGroupId.value);
      });
  }
  showDetailInformation(locationName: string) {
    console.log(`showDetailInformation: ${locationName}`);
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
  showPendingInventory(locationName: string) {
    console.log(`showPendingInventory: ${locationName}`);
  }
  showArrivedQuantity(locationName: string) {
    console.log(`showArrivedQuantity: ${locationName}`);
  }
  showDistributionWorkChanged(showDistributionWork) {
    this.showDistributionWork = showDistributionWork;

    this.gridDisplaySpan = showDistributionWork ? 16 : 24;
  }
}
