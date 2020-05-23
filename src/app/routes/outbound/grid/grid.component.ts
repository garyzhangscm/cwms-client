import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { GridConfiguration } from '../models/grid-configuration';
import { GridConfigurationService } from '../services/grid-configuration.service';
import { GridLocationConfigurationService } from '../services/grid-location-configuration.service';
import { GridDistributionWorkService } from '../services/grid-distribution-work.service';
import { GridDistributionWork } from '../models/grid-distribution-work';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { I18NService } from '@core';
import { InventoryService } from '../../inventory/services/inventory.service';

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
  permanentLPNFlag: boolean;
  permanentLPN: string;
  currentLPN: string;
}
interface RowData {
  cells: CellData[];
}

interface InventoryData {
  itemName: string;
  quantity: number;
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
  workInProgress = false;

  processedInventoryVisible = false;
  pendingInventoryVisible = false;
  // list of processed inventory
  // key: item name
  // value: quantity of the item in the location
  listOfProcessedInventory: InventoryData[];

  listOfPendingInventory: GridDistributionWork[] = [];

  @ViewChild('itemNameTextBox', { static: true }) itemNameTextBox: ElementRef;

  constructor(
    private fb: FormBuilder,
    private gridConfigurationService: GridConfigurationService,
    private gridLocationConfigurationService: GridLocationConfigurationService,
    private gridDistributionWorkService: GridDistributionWorkService,
    private messageService: NzMessageService,
    private i18n: I18NService,
    private inventoryService: InventoryService,
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

    // refresh every 1 minutes
    setTimeout(() => {
      this.refreshGrid();
    }, 60000);
  }

  // Refresh to get the latest status of the
  // grid
  refreshGrid() {
    // only refresh when
    // 1. we have choosen the grid
    // 2. fresh checkbox is turn on
    // 3. no one is working on the page right now
  }
  resetForm() {
    this.gridQueryForm.controls.inventoryId.reset();
    this.gridQueryForm.controls.itemName.reset();
    this.workInProgress = false;
  }

  refreshGridDisplay(locationGroupId: number, resetInventoryId?: boolean, resetItemNumber?: boolean) {
    this.gridRows = [];

    if (resetInventoryId !== false) {
      this.gridQueryForm.controls.inventoryId.reset();
    }
    if (resetItemNumber !== false) {
      this.gridQueryForm.controls.itemName.reset();
    }

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
          progress:
            (gridLocationConfiguration.arrivedQuantity * 100) /
            (gridLocationConfiguration.pendingQuantity + gridLocationConfiguration.arrivedQuantity),
          pendingQuantity: gridLocationConfiguration.pendingQuantity,
          arrivedQuantity: gridLocationConfiguration.arrivedQuantity,
          permanentLPNFlag: gridLocationConfiguration.permanentLPNFlag,
          permanentLPN: gridLocationConfiguration.permanentLPN,
          currentLPN: gridLocationConfiguration.currentLPN,
        });
      });

      if (currentRow.cells.length > 0) {
        // Save the last row
        this.gridRows.push(currentRow);
      }

      if (this.gridQueryForm.controls.inventoryId.value) {
        this.displayDistributionWork(
          this.gridQueryForm.controls.locationGroupId.value,
          this.gridQueryForm.controls.inventoryId.value,
        );
      }
    });
  }
  onUserInputInventoryIdEnter() {
    this.itemNameTextBox.nativeElement.focus();
  }
  onUserInputInventoryIdBlur() {
    if (this.gridQueryForm.controls.inventoryId.value) {
      this.workInProgress = true;
      this.displayDistributionWork(
        this.gridQueryForm.controls.locationGroupId.value,
        this.gridQueryForm.controls.inventoryId.value,
      );
    }
  }

  displayDistributionWork(locationGroupId: number, inventoryId: string) {
    this.gridDistributionWorkService.get(locationGroupId, inventoryId).subscribe(gridDistributionWorks => {
      this.listOfDistributionWork = gridDistributionWorks;
      gridDistributionWorks.forEach(gridDistributionWork => {
        this.markCellAsInprocess(gridDistributionWork.gridLocationName);
      });

      this.workInProgress = false;
    });
  }

  // Click the grid cell to confirm by the inventory group id(LPN / Pick List Number / Carton Number / etc)
  gridCellClicked(gridLocationConfigurationId: number) {
    this.workInProgress = true;
    this.gridDistributionWorkService
      .confirm(gridLocationConfigurationId, this.gridQueryForm.controls.inventoryId.value)
      .subscribe(res => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        // reload the grid information after confirm
        // we will clear the id and item number field as we are already
        // confirmed the whole id(container)
        this.refreshGridDisplay(this.gridQueryForm.controls.locationGroupId.value, true, true);

        this.workInProgress = false;
      });
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
  onUserInputItemNameEvent() {
    this.workInProgress = true;
    const inprocessCells = this.getInprocessCell();
    if (inprocessCells.length > 1) {
      console.log(`We should only have one in process cell`);
    } else if (inprocessCells.length === 0) {
      console.log(`We should have at least one in process cell`);
    } else {
      this.gridDistributionWorkService
        .confirmByItem(
          this.gridQueryForm.controls.locationGroupId.value,
          inprocessCells[0].gridLocationConfigurationId,
          this.gridQueryForm.controls.inventoryId.value,
          this.gridQueryForm.controls.itemName.value,
        )
        .subscribe(res => {
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          // reload the grid information after confirm
          // we will only reset the item number field so that the user
          // can continue with the next item in the same id(container)
          this.refreshGridDisplay(this.gridQueryForm.controls.locationGroupId.value, false, true);
          this.workInProgress = false;
        });
    }
  }
  showPendingInventory(cell: CellData) {
    this.pendingInventoryVisible = true;

    this.gridDistributionWorkService
      .getByGridLocation(cell.gridLocationConfigurationId)
      .subscribe(gridDistributionWorks => {
        this.listOfPendingInventory = gridDistributionWorks;
      });
  }
  showArrivedQuantity(cell: CellData) {
    this.processedInventoryVisible = true;

    this.listOfProcessedInventory = [];
    this.inventoryService.getInventoriesByLocationName(cell.locationName).subscribe(inventories => {
      const processInventories: InventoryData[] = [];
      inventories.forEach(inventory => {
        const matchedProcessedInventory = processInventories.filter(
          processedInventory => processedInventory.itemName === inventory.item.name,
        );
        if (matchedProcessedInventory.length === 0) {
          processInventories.push({
            itemName: inventory.item.name,
            quantity: inventory.quantity,
          });
        } else {
          matchedProcessedInventory[0].quantity += inventory.quantity;
        }
      });
      this.listOfProcessedInventory = processInventories;
    });
  }
  showDistributionWorkChanged(showDistributionWork) {
    this.showDistributionWork = showDistributionWork;

    this.gridDisplaySpan = showDistributionWork ? 16 : 24;
  }
  cancelPendingInventoryModal() {
    this.pendingInventoryVisible = false;
  }
  confirmPendingInventoryModal() {
    this.pendingInventoryVisible = false;
  }
  cancelProcessedInventoryModal() {
    this.processedInventoryVisible = false;
  }
  confirmProcessedInventoryModal() {
    this.processedInventoryVisible = false;
  }

  getInprocessCell(): CellData[] {
    let cells: CellData[] = [];
    this.gridRows.forEach(row => {
      cells = cells.concat(row.cells.filter(cell => cell.status === CellStatus.IMPROCESS));
    });

    return cells;
  }
}
