import { test, expect } from '@playwright/test';

test.describe('Eisenhower Bubble Board', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should load the app with empty state', async ({ page }) => {
    await page.goto('/');
    
    // Check that the app loads
    await expect(page.getByRole('heading', { name: 'Eisenhower Bubble Board' })).toBeVisible();
    
    // Check empty state
    await expect(page.getByText('Add your first task')).toBeVisible();
    await expect(page.getByText('Start organizing your priorities')).toBeVisible();
    
    // Check that today's completes shows 0
    await expect(page.getByText("Today's completes: 0")).toBeVisible();
  });

  test('should add a task successfully', async ({ page }) => {
    await page.goto('/');
    
    // Add a task
    await page.getByPlaceholder('Add a task…').fill('Test task');
    await page.getByRole('button', { name: 'Add Task' }).click();
    
    // Check that the task appears as a bubble
    await expect(page.getByText('Test task')).toBeVisible();
    
    // Check that empty state is gone
    await expect(page.getByText('Add your first task')).not.toBeVisible();
    
    // Check that today's completes is still 0 (not completed yet)
    await expect(page.getByText("Today's completes: 0")).toBeVisible();
  });

  test('should add task with different impact sizes', async ({ page }) => {
    await page.goto('/');
    
    // Add small task
    await page.getByPlaceholder('Add a task…').fill('Small task');
    await page.getByRole('combobox', { name: 'Impact (size)' }).selectOption('1');
    await page.getByRole('button', { name: 'Add Task' }).click();
    
    // Add medium task
    await page.getByPlaceholder('Add a task…').fill('Medium task');
    await page.getByRole('combobox', { name: 'Impact (size)' }).selectOption('2');
    await page.getByRole('button', { name: 'Add Task' }).click();
    
    // Add large task
    await page.getByPlaceholder('Add a task…').fill('Large task');
    await page.getByRole('combobox', { name: 'Impact (size)' }).selectOption('3');
    await page.getByRole('button', { name: 'Add Task' }).click();
    
    // Check that all tasks are visible
    await expect(page.getByText('Small task')).toBeVisible();
    await expect(page.getByText('Medium task')).toBeVisible();
    await expect(page.getByText('Large task')).toBeVisible();
    
    // Check that bubbles have different sizes (we can't easily test exact sizes, but we can check they exist)
    const bubbles = page.locator('[data-testid="bubble"]');
    await expect(bubbles).toHaveCount(3);
  });

  test('should complete a task when clicked', async ({ page }) => {
    await page.goto('/');
    
    // Add a task
    await page.getByPlaceholder('Add a task…').fill('Task to complete');
    await page.getByRole('button', { name: 'Add Task' }).click();
    
    // Click the bubble to complete it
    await page.getByText('Task to complete').click();
    
    // Check that today's completes increased to 1
    await expect(page.getByText("Today's completes: 1")).toBeVisible();
    
    // Check that the task shows as completed (should have different styling)
    const completedBubble = page.getByText('Task to complete').locator('..');
    await expect(completedBubble).toHaveClass(/bg-emerald/);
  });

  test('should delete a task with Alt+Click', async ({ page }) => {
    await page.goto('/');
    
    // Add a task
    await page.getByPlaceholder('Add a task…').fill('Task to delete');
    await page.getByRole('button', { name: 'Add Task' }).click();
    
    // Verify task exists
    await expect(page.getByText('Task to delete')).toBeVisible();
    
    // Alt+Click to delete
    await page.getByText('Task to delete').click({ modifiers: ['Alt'] });
    
    // Check that task is gone
    await expect(page.getByText('Task to delete')).not.toBeVisible();
    
    // Check that empty state is back
    await expect(page.getByText('Add your first task')).toBeVisible();
  });

  test('should drag task between quadrants', async ({ page }) => {
    await page.goto('/');
    
    // Add a task
    await page.getByPlaceholder('Add a task…').fill('Draggable task');
    await page.getByRole('button', { name: 'Add Task' }).click();
    
    // Get the initial position
    const bubble = page.getByText('Draggable task').locator('..');
    const initialPosition = await bubble.boundingBox();
    
    // Drag the bubble to a different position
    await bubble.dragTo(page.locator('[style*="height: 540px"]'), {
      targetPosition: { x: 100, y: 100 }
    });
    
    // Check that the bubble moved (position should be different)
    const newPosition = await bubble.boundingBox();
    expect(newPosition?.x).not.toBe(initialPosition?.x);
    expect(newPosition?.y).not.toBe(initialPosition?.y);
  });

  test('should show quadrant labels correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check axis labels
    await expect(page.getByText('Urgent ↑')).toBeVisible();
    await expect(page.getByText('Important →')).toBeVisible();
    
    // Check quadrant names
    await expect(page.getByText('Do Now')).toBeVisible();
    await expect(page.getByText('Plan')).toBeVisible();
    await expect(page.getByText('Delegate')).toBeVisible();
    await expect(page.getByText('Eliminate')).toBeVisible();
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    await page.goto('/');
    
    // Test Ctrl+Enter to add task
    await page.getByPlaceholder('Add a task…').fill('Keyboard task');
    await page.keyboard.press('Control+Enter');
    
    // Check that task was added
    await expect(page.getByText('Keyboard task')).toBeVisible();
  });

  test('should export and import tasks', async ({ page }) => {
    await page.goto('/');
    
    // Add a task
    await page.getByPlaceholder('Add a task…').fill('Export test task');
    await page.getByRole('button', { name: 'Add Task' }).click();
    
    // Complete the task
    await page.getByText('Export test task').click();
    
    // Export tasks
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export' }).click();
    const download = await downloadPromise;
    
    // Check that file was downloaded
    expect(download.suggestedFilename()).toContain('bubble-board-tasks');
    
    // Clear tasks
    await page.getByText('Export test task').click({ modifiers: ['Alt'] });
    
    // Import tasks (we'll simulate this by setting localStorage directly)
    const exportData = {
      version: 'ebb_v1',
      tasks: [{
        id: 'imported-task',
        title: 'Imported task',
        x: 0.5,
        y: 0.5,
        impact: 2,
        doneAt: null
      }]
    };
    
    await page.evaluate((data) => {
      localStorage.setItem('ebb_v1', JSON.stringify(data));
    }, exportData);
    
    // Reload page
    await page.reload();
    
    // Check that imported task is visible
    await expect(page.getByText('Imported task')).toBeVisible();
  });

  test('should show help modal', async ({ page }) => {
    await page.goto('/');
    
    // Click help button
    await page.getByRole('button', { name: 'Help & Shortcuts' }).click();
    
    // Check that help modal is visible
    await expect(page.getByRole('heading', { name: 'Help & Shortcuts' })).toBeVisible();
    
    // Check that keyboard shortcuts are shown
    await expect(page.getByText('Ctrl/Cmd + Enter')).toBeVisible();
    await expect(page.getByText('Add new task')).toBeVisible();
    
    // Close modal
    await page.getByRole('button', { name: 'Close help modal' }).click();
    
    // Check that modal is closed
    await expect(page.getByRole('heading', { name: 'Help & Shortcuts' })).not.toBeVisible();
  });

  test('should show onboarding hints for new users', async ({ page }) => {
    await page.goto('/');
    
    // Check that onboarding hints are visible for new users
    await expect(page.getByText('Add a task')).toBeVisible();
    
    // Add a task to dismiss the first hint
    await page.getByPlaceholder('Add a task…').fill('Test task');
    await page.getByRole('button', { name: 'Add Task' }).click();
    
    // Check that the next hint appears
    await expect(page.getByText('Drag to prioritize')).toBeVisible();
  });

  test('should validate input and show character count', async ({ page }) => {
    await page.goto('/');
    
    // Type a long task title
    const longTitle = 'A'.repeat(250);
    await page.getByPlaceholder('Add a task…').fill(longTitle);
    
    // Check that character count appears
    await expect(page.getByText('250/200')).toBeVisible();
    
    // Check that add button is disabled for empty title
    await page.getByPlaceholder('Add a task…').clear();
    await expect(page.getByRole('button', { name: 'Add Task' })).toBeDisabled();
  });

  test('should handle error states gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Try to import invalid JSON
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'invalid.json',
      mimeType: 'application/json',
      buffer: Buffer.from('invalid json content')
    });
    
    // Check that error message appears
    await expect(page.getByText('Invalid file format')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that the app is still functional on mobile
    await expect(page.getByRole('heading', { name: 'Eisenhower Bubble Board' })).toBeVisible();
    
    // Add a task on mobile
    await page.getByPlaceholder('Add a task…').fill('Mobile task');
    await page.getByRole('button', { name: 'Add Task' }).click();
    
    // Check that task was added
    await expect(page.getByText('Mobile task')).toBeVisible();
  });
});
