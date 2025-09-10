import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-wrap">
      <div class="dialog-header">
        <!-- <mat-icon aria-hidden="true">warning</mat-icon> -->
      </div>

      <div class="dialog-body">
        Are you sure you want to delete <strong>{{ data.name }}</strong
        >?
      </div>

      <div class="dialog-actions">
        <button mat-stroked-button (click)="close(false)">Cancel</button>
        <button mat-flat-button color="warn" (click)="close(true)">
          <mat-icon>delete</mat-icon> Delete
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-wrap {
        padding: 18px 6px;
        width: 360px;
        box-sizing: border-box;
      }
      .dialog-header {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .dialog-header h3 {
        margin: 0;
        font-size: 1.05rem;
      }
      .dialog-body {
        margin: 16px 0;
        color: rgba(0, 0, 0, 0.85);
      }
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    `,
  ],
})
export class ConfirmDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: { name?: string }
  ) {}

  close(result: boolean) {
    this.dialogRef.close(result);
  }
}
