export class PlanifRepo {
  constructor() {
    this.items = [];
  }

  guardar(item) {
    this.items.push(item);
  }
}
