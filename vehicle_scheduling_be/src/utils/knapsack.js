export const knapsack = (vehicles,capacity)=> {
    const memo = new Map()

    const solve = (index,remainingCapacity)=> {
        if(index >= vehicles.length || remainingCapacity <= 0) {
            return {impact: 0,selected: []}
        }

        const key = `${index}-${remainingCapacity}`
        if(memo.has(key)) {
            return memo.get(key)
        }

        const skip = solve(index + 1, remainingCapacity)
        let take = {impact: -Infinity, selected: []}

        const vehicle = vehicles[index]
        if(vehicle.Duration <= remainingCapacity) {
            const next = solve(index+1,remainingCapacity-vehicle.Duration)
            take = {
        impact: vehicle.Impact + next.impact,
        selected: [vehicle, ...next.selected]
      }
        }

        const result =
      take.impact > skip.impact
        ? take
        : {
            impact: skip.impact,
            selected: [...skip.selected]
          };

    memo.set(key, result);
    return result;

        
    }

    const result = solve(0, capacity);
return {
    selectedVehicles: result.selected,
    totalImpact: result.impact,
    totalDuration: result.selected.reduce(
      (sum, vehicle) => sum + vehicle.Duration,
      0
    )
  };
};
