import { BAR_ID, CLASS } from "./menuReorderStyle.js";

// Bottom-left panel with the reorder actions.
export function buildEditBar({ onReset, onLock }) {
  if (document.getElementById(BAR_ID)) return;
  const bar = document.createElement("div");
  bar.id = BAR_ID;
  bar.innerHTML = `
    <span class="${CLASS}-text">
      <span class="${CLASS}-title">Re-order side menu</span>
      <span class="${CLASS}-hint">
        Drag a section into place, then lock the order in. Home stays first.
      </span>
    </span>
    <button type="button" class="${CLASS}-reset">Reset</button>
    <button type="button" class="${CLASS}-lock">&#10003;&nbsp; Lock order</button>
  `;
  bar.querySelector(`.${CLASS}-reset`).addEventListener("click", onReset);
  bar.querySelector(`.${CLASS}-lock`).addEventListener("click", onLock);
  document.body.appendChild(bar);
}

export function setEditBarMessage(message, isError = false) {
  const hint = document.querySelector(`#${BAR_ID} .${CLASS}-hint`);
  if (!hint) return;
  hint.textContent = message;
  hint.style.color = isError ? "#d32f2f" : "#666666";
}

export function setEditBarBusy(busy) {
  const bar = document.getElementById(BAR_ID);
  if (!bar) return;
  const buttons = bar.querySelectorAll("button");
  buttons.forEach((button) => {
    button.disabled = busy;
  });
  const lockButton = bar.querySelector(`.${CLASS}-lock`);
  if (lockButton) lockButton.textContent = busy ? "Saving..." : "✓  Lock order";
}
