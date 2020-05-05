// 定义画布
var svg = d3.select("#svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");
//定义力导向图
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(80))
	.force("charge", 
		d3.forceManyBody()
			.strength(-400)
			.theta(0.1)
			.distanceMax(200)
		)
    .force("center", d3.forceCenter(width / 2, height / 2));
// 力导向图的拖拽起承合
function dragstarted(d) {
    if (!d3.event.active) 
		simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}
function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}
function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
// 获取增量图谱数据并可视化
var nodes = [];
var edges = [];
var graph = {};
function show_augment_KG()
{
	var triples = triples_ent;
	var entityId = {};
	var nodesAll = {};
	var id = 0;
	var categories = document.getElementsByClassName("r-family");
	var exist = {};
	var color = {"人名": "#ff7575", "地名": "#A6FFFF", "机构名": "#FFFF93"};
	nodes = [];
	edges = [];
	// {'name': , 'id': , 'r': , 'color': , 'category': }
	// 生成点节点
	for (var i = 0; i < triples.length; i++)
	{
		var triple = triples[i];
		if (triple[4]==0)
			continue;
		
		for (var j =0; j < 2; j++)
		{
			if (!exist[triple[j][0]])
			{
				entityId[triple[j][0]] = id;
				var temp = {};
				temp["name"] = triple[j][0];
				temp["id"] = id;
				temp["r"] = 20;
				temp["color"] = can_color[ent_color_id[triple[j][1]]].substr(0,7);
				temp["category"] = triple[j][1];
				nodes.push(temp);
				exist[triple[j][0]] = 1;
				id ++;
			}
		}
	}
	
	// {'source': , 'target': , 'label': , 'id': }
	// 生成边节点
	for (var i = 0; i < triples.length; i++)
	{
		triple = triples[i];
		if (triple[4] == 0)
			continue;
		
		var temp = {};
		temp['source'] = entityId[triple[0][0]];
		temp['target'] = entityId[triple[1][0]];
		temp['label'] = triple[2];
		temp["id"] = id;
		edges.push(temp);
		id ++;
	}
	graph = {"nodes": nodes, "edges": edges};
	run(graph);
}
// 运行力导向图
function run(graph) {

	// 清空画布
	d3.select("#svg").selectAll("*").remove();
	
	// 定义边的属性
	var link = svg.append("g")
		.attr("class", "edges")
		.style("stroke", "#ada")
		.selectAll("line")
		.data(graph.edges)
		.enter().append("line")
		.attr("id", function(d) { return "edge" + d.id });

	// 定义节点的属性
	var node = svg.append("g")
		.attr("class", "nodes")
		.selectAll("circle")
		.data(graph.nodes)
		.enter().append("circle")
		.attr("r", function(d){ return d.r; })
		.attr("id", function(d) { return "node" + d.id; })
		.attr("data-legend", function(d) { return d.type;})
		.style("fill", function(d) {return d.color; })
		.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended));

	// 点击中心人物，发起搜索
	var label = svg.append("g")
		.attr("class", "labels")
		.selectAll("text")
		.data(graph.nodes)
		.enter().append("text")
		.attr("class", "label")
		.attr("id", function(d) { return "nodelabel" + d.id; })
		.attr("onclick", function(d) {
			if (d.type == "中心人物")
			{
				return "window.open(\"/search?wd=" + d.name + "\")";
			}
			else if ((d.topicid == null) || (d.topicid == undefined) || (d.topicid.length == 0))
			{
				return "window.open(\"/search?wd=" + graph.nodes[0].name + " " + d.name + "\")";
			}
			else {
				return "window.open(\"/topic/" + d.topicid + "\")"
			}
		})
		.text(function(d) { 
			if ((d.topicid == null) || (d.topicid == undefined) || (d.topicid.length == 0))
				return d.name; 
			else 
			{
				if (d.name.length > 10)
					return d.name.substring(0, 7) + "...";
				else return d.name
			}
		})
		.attr("text-anchor","middle")
		.attr("dx", "5px")
		.style("font-size", "15px")
		.style("fill", "#333")
		.style("font-weight", 'bold')
		.style("cursor", "pointer");

	// 调用无名函数，其中会创建legend-text元素，调用legend_click函数
	//var legend = svg.append("g").call(d3.legend);

	// 画出边
	var edgepaths = svg.append("g")
		.attr("class", "edgepaths")
		.selectAll("path")
		.data(graph.edges)
		.enter().append("path")
		.attrs({
			'class': 'edgepath',
			'fill-opacity': 0,
			'stroke-opacity': 1,
			'id': function (d) {return 'edgepath' + d.id;}
		})
		.style("pointer-events", "none");

	var edgelabels = svg.append("g")
		.attr("class", "edgelabels")
		.selectAll("text")
		.data(graph.edges)
		.enter().append("text")
		.style("pointer-events", "none")
		.attrs({
			'class': 'edgelabel',
			'id': function (d) {return 'edgelabel' + d.id;},
			'font-size': 12,
			'fill': '#aaa'
		})

	edgelabels.append('textPath')
		.attr('xlink:href', function (d) {return '#edgepath' + d.id;})
		.style("text-anchor", "middle")
		.style("pointer-events", "none")
		.attr("startOffset", "50%")
		.text(function (d) {return d.label})


	simulation
		.nodes(graph.nodes)
		.on("tick", ticked);

	simulation.force("link")
		.links(graph.edges);
		
	simulation.alphaTarget(0.3).restart()

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
        node
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        label
            .attr("x", function(d) { return d.x-5; })
            .attr("y", function (d) { return d.y+5; })
        edgepaths
            .attr('d', function (d) {
                return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
            });
        edgelabels
            .attr('transform', function (d) {
                if (d.target.x < d.source.x) {
                    var bbox = this.getBBox();
                    rx = bbox.x + bbox.width / 2;
                    ry = bbox.y + bbox.height / 2;
                    return 'rotate(180 ' + rx + ' ' + ry + ')';
                }
                else {
                    return 'rotate(0)';
                }
        });
    }
}

// 列出实体的属性
function show_augment_attribute()
{
	
}

// 点击上传增量图谱
function click_download_KG_button()
{
	var small_nodes = [];
	var small_edges = [];
	for (var i = 0; i < nodes.length; i++)
	{
		var temp = {};
		temp["name"] = nodes[i]["name"];
		temp["category"] = nodes[i]["category"];
		small_nodes.push(temp);
	}
	for (var i = 0; i < edges.length; i++)
	{
		var temp = {};
		temp["e1"] = edges[i]["source"]["name"];
		temp["category1"] = edges[i]["source"]["category"];
		temp["e2"] = edges[i]["target"]["name"];
		temp["category2"] = edges[i]["target"]["category"];
		temp["label"] = edges[i]["label"];
		small_edges.push(temp);
	}
	small_graph = {"nodes": small_nodes, "edges": small_edges};
	console.log(small_graph);
	axios.post('/neo4j', Qs.stringify(
		small_graph,{indices:false}
		//"nodes": nodes,
		//"edges": edges
	))
	.then(function (response) {
		if(response)
			alert("下载成功");
		else
			alert("下载失败");
	})
	.catch(function (error)
	{
		console.log(error);
	});
}



