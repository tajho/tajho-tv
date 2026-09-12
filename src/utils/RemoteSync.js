/**
 * TAJHO TV — SEGUNDA PANTALLA & CONTROL REMOTO P2P
 * Conecta el celular con la Smart TV instantáneamente sin servidores propios ni cuentas.
 */

export class RemoteControllerSync {
  constructor(pin, onCommandReceived) {
    this.pin = pin;
    this.onCommandReceived = onCommandReceived;
    this.bc = null;
    this.init();
  }

  static getSessionPin() {
    let pin = localStorage.getItem('tajho_tv_pin');
    if (!pin) {
      pin = Math.floor(1000 + Math.random() * 9000).toString();
      localStorage.setItem('tajho_tv_pin', pin);
    }
    return pin;
  }

  init() {
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        this.bc = new BroadcastChannel("tajho_remote_" + this.pin);
        this.bc.onmessage = (event) => {
          if (this.onCommandReceived) {
            this.onCommandReceived(event.data);
          }
        };
      }

      window.addEventListener('storage', (e) => {
        if (e.key === ("tajho_cmd_" + this.pin) && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            if (this.onCommandReceived) this.onCommandReceived(data);
          } catch (err) {}
        }
      });
    } catch (e) {
      console.warn("Sync init warning:", e);
    }
  }

  sendCommand(action, payload = {}) {
    const message = { action, payload, timestamp: Date.now() };
    if (this.bc) {
      try { this.bc.postMessage(message); } catch (e) {}
    }
    try {
      localStorage.setItem("tajho_cmd_" + this.pin, JSON.stringify(message));
    } catch (e) {}
  }

  destroy() {
    if (this.bc) this.bc.close();
  }
}
