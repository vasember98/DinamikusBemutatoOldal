// src/lib/dnd/actions/draggable.ts
import { startDrag, moveDrag, endDrag } from '../DragManager';

type Opts = {
  id: string;
  activate?: 'immediate' | 'hold';
  holdMs?: number;   // delay for long-press
  slop?: number;     // movement threshold to trigger drag
};

let lastPointerGlobal = { x: 0, y: 0 };

// Is this element (or an ancestor up to the node) interactive?
function isInteractive(el: Element | null, stopAt: HTMLElement): boolean {
  const INTERACTIVE = /^(A|BUTTON|INPUT|SELECT|TEXTAREA|LABEL|SUMMARY|VIDEO|AUDIO|DETAILS)$/;
  while (el && el !== stopAt) {
    const he = el as HTMLElement;
    if (
      he.isContentEditable ||
      (he.tagName && INTERACTIVE.test(he.tagName)) ||
      (he as HTMLInputElement).type === 'file' ||
      he.getAttribute?.('role') === 'button' // catches some custom buttons
    ) {
      return true;
    }
    el = he.parentElement;
  }
  return false;
}

export function draggable(node: HTMLElement, opts: Opts) {
  let { id, activate = 'hold', holdMs = 220, slop = 6 } = opts;

  let dragging = false;
  let kbDragging = false;
  let startX = 0;
  let startY = 0;
  let suppressClick = false;
  let holdTimer: number | null = null;

  function clearHold() {
    if (holdTimer != null) {
      window.clearTimeout(holdTimer);
      holdTimer = null;
    }
  }

  function startDragFromPointer(e: PointerEvent) {
    const rect = node.getBoundingClientRect();
    const pointer = { x: e.clientX, y: e.clientY };
    const label = node.getAttribute('aria-label') ?? node.getAttribute('data-label') ?? undefined;
    startX = e.clientX;
    startY = e.clientY;
    startDrag(id, rect, pointer, label);
    lastPointerGlobal = pointer;
    dragging = true;
    suppressClick = true;
    document.documentElement.classList.add('app-dragging');
    node.setPointerCapture?.(e.pointerId);
  }

  function endDragClean() {
    endDrag();
    dragging = false;
    kbDragging = false;
    clearHold();
    document.documentElement.classList.remove('app-dragging');
  }

  // Pointer handlers
  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    if (isInteractive(e.target as Element, node)) return;

    startX = e.clientX;
    startY = e.clientY;

    if (activate === 'immediate') {
      // Defer until slop exceeded to preserve click
      const onMoveOnce = (ev: PointerEvent) => {
        const dx = Math.abs(ev.clientX - startX);
        const dy = Math.abs(ev.clientY - startY);
        if (dx >= slop || dy >= slop) {
          window.removeEventListener('pointermove', onMoveOnce);
          startDragFromPointer(ev);
        }
      };
      window.addEventListener('pointermove', onMoveOnce);
      const cancel = () => window.removeEventListener('pointermove', onMoveOnce);
      window.addEventListener('pointerup', cancel, { once: true });
      window.addEventListener('pointercancel', cancel, { once: true });
    } else {
      clearHold();
      holdTimer = window.setTimeout(() => {
        startDragFromPointer(e);
      }, holdMs);
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
    window.addEventListener('pointercancel', onPointerCancel, { once: true });
    node.addEventListener('lostpointercapture', onLostCapture);
  }

  function onPointerMove(e: PointerEvent) {
    if (holdTimer != null) {
      const dx = Math.abs(e.clientX - startX);
      const dy = Math.abs(e.clientY - startY);
      if (dx >= slop || dy >= slop) {
        // cancel long-press if user wiggles out
        clearHold();
      }
    }
    if (dragging) {
      const p = { x: e.clientX, y: e.clientY };
      lastPointerGlobal = p;
      moveDrag(p);
    }
  }

  function onPointerUp(_e: PointerEvent) {
    clearHold();
    if (dragging) {
      endDragClean();
    }
    window.removeEventListener('pointermove', onPointerMove);
    node.removeEventListener('lostpointercapture', onLostCapture);
  }
  function onPointerCancel(_e: PointerEvent) {
    clearHold();
    if (dragging) {
      endDragClean();
    }
    window.removeEventListener('pointermove', onPointerMove);
    node.removeEventListener('lostpointercapture', onLostCapture);
  }
  function onLostCapture() {
    clearHold();
    if (dragging) {
      endDragClean();
    }
    window.removeEventListener('pointermove', onPointerMove);
  }

  // Stop the native click that follows a drag
  function onClickCapture(e: MouseEvent) {
    if (suppressClick) {
      e.stopPropagation();
      e.preventDefault();
      suppressClick = false;
    }
  }

  // Keyboard: Space/Enter to pick up/put down; arrows to move
  function onKeyDown(e: KeyboardEvent) {
    const isActivateKey = e.key === ' ' || e.key === 'Enter';
    if (isActivateKey && !kbDragging) {
      e.preventDefault();
      kbDragging = true;
      const rect = node.getBoundingClientRect();
      const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const label = node.getAttribute('aria-label') ?? node.getAttribute('data-label') ?? undefined;
      startDrag(id, rect, center, label);
      lastPointerGlobal = center;
      document.documentElement.classList.add('app-dragging');
      return;
    }

    if (!kbDragging) return;

    let dx = 0, dy = 0;
    const step = 16;
    if (e.key === 'ArrowLeft') dx = -step;
    else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = -step;
    else if (e.key === 'ArrowDown') dy = step;

    if (dx || dy) {
      e.preventDefault();
      const next = { x: lastPointerGlobal.x + dx, y: lastPointerGlobal.y + dy };
      lastPointerGlobal = next;
      moveDrag(next);
      return;
    }

    if (isActivateKey) {
      e.preventDefault();
      kbDragging = false;
      endDragClean();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      kbDragging = false;
      endDragClean();
    }
  }

  node.addEventListener('pointerdown', onPointerDown);
  node.addEventListener('click', onClickCapture, true);
  node.addEventListener('keydown', onKeyDown);

  return {
    update(next: Opts) {
      id = next.id ?? id;
      activate = next.activate ?? activate;
      holdMs = next.holdMs ?? holdMs;
      slop = next.slop ?? slop;
    },
    destroy() {
      clearHold();
      node.removeEventListener('pointerdown', onPointerDown);
      node.removeEventListener('click', onClickCapture, true);
      node.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointermove', onPointerMove);
      // in case the listeners are still pending (edge cases)
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      node.removeEventListener('lostpointercapture', onLostCapture);
      document.documentElement.classList.remove('app-dragging');
    }
  };
}
