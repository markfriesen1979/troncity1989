/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { BaseTool } from './baseTool';
import { DIRT, WOODS_LOW, WOODS_HIGH } from './tileValues';

var makeTool = BaseTool.makeTool;
var TerrainTool = makeTool(function(map, direction) {
  this.init(20, map, false, true);
  this._direction = direction;
  this._elevations = {};
});


TerrainTool.prototype.clear = function() {
  this._applicationCost = 0;
  this._elevations = {};
};


TerrainTool.prototype.doTool = function(x, y) {
  if (!this._map.testBounds(x, y)) {
    this.result = this.TOOLRESULT_FAILED;
    return;
  }

  var tile = this._map.getTileValue(x, y);
  if (tile !== DIRT && (tile < WOODS_LOW || tile > WOODS_HIGH)) {
    this.result = this.TOOLRESULT_FAILED;
    return;
  }

  var key = x + ',' + y;
  var elevation = this._elevations[key];
  if (elevation === undefined)
    elevation = this._map.getElevation(x, y);

  var nextElevation = elevation + this._direction;
  if (nextElevation < 0 || nextElevation > this._map.constructor.MAX_ELEVATION) {
    this.result = this.TOOLRESULT_FAILED;
    return;
  }

  this._elevations[key] = nextElevation;
  this.addCost(this.toolCost);
  this.result = this.TOOLRESULT_OK;
};


TerrainTool.prototype.modifyIfEnoughFunding = function(budget) {
  if (this.result !== this.TOOLRESULT_OK) {
    this.clear();
    return false;
  }

  if (budget.totalFunds < this._applicationCost) {
    this.result = this.TOOLRESULT_NO_MONEY;
    this.clear();
    return false;
  }

  var keys = Object.keys(this._elevations);
  for (var i = 0; i < keys.length; i++) {
    var coordinates = keys[i].split(',');
    this._map.setElevation(coordinates[0] - 0, coordinates[1] - 0, this._elevations[keys[i]]);
  }

  budget.spend(this._applicationCost);
  this.clear();
  return true;
};


export { TerrainTool };
