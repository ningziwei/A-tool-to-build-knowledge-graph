// d3.legend.js 
// (C) 2012 ziggy.jonsson.nyc@gmail.com
// MIT licence

(function() 
{
	d3.legend = 
	function(g) 
	{
		g.each
		(
			function() 
			{
				var g= d3.select(this),
					items = {},
					svg = d3.select(g.property("nearestViewportElement")),
					legendPadding = g.attr("data-style-padding") || 5;

				svg.selectAll("[data-legend]")
					.each
					(
						function() 
						{
							var self = d3.select(this)
							items[self.attr("data-legend")] = 
							{
								pos : self.attr("data-legend-pos") || this.getBBox().y,
								color : self.attr("data-legend-color") != undefined ? self.attr("data-legend-color") : self.style("fill") != 'none' ? self.style("fill") : self.style("stroke") 
							}
						}
					)

				items = d3.entries(items).sort(function(a,b) { return a.value.pos-b.value.pos})

				var legend_items = document.getElementsByClassName('legend-items')[0];
				var table = document.createElement('table');
					table.setAttribute("class", "legend-table");
				var tr = document.createElement('tr');
				for (var i = 0; i < items.length; i++)
				{
					var td = document.createElement('td');
					var span = document.createElement("span");
					span.setAttribute("class", "legend-text");
					span.setAttribute("onclick", "click_legend(event)");
					span.appendChild(document.createTextNode(items[i].key));
					span.setAttribute("style", "background-color: " + items[i].value.color);
					td.appendChild(span);
					tr.appendChild(td);
				}
				table.appendChild(tr);
				legend_items.appendChild(table); 
			}
		)
	}
}
)()