// TODO Optionalが中に入ってるパターンはパースできないです。
// TODO String, Int, Longなどを Apiblueprintの適切な形に変換したい（ex. string, number, boolean）
window.onload = function(){
  bindStartButton();
  addPlaceholder();
}

function bindStartButton() {
  var parserButton = document.querySelector("#parserButton");
  parserButton.addEventListener('click', function(){parseCassClassToApiBlueprint()}, false);
}

function parseCassClassToApiBlueprint() {
  var inputValue = document.querySelector('#inputArea').value;
  var heredoc = inputValue.replace(/^\/\*/, "").replace(/\*\/$/, "");
  var minimalizedStr = minimalize(heredoc)
  var className = getClassName(minimalizedStr);
  var propertiesStr = splitProperty(minimalizedStr);
  var properties = parsepropertiestring(propertiesStr);
  var result = AddOptionalProperty(properties);
  var processingObj = removeStringOfOptional(result);
  var replacedSeqToArray = replaceSeqToArray(processingObj);
  var result = writeResultCaseClass(className, replacedSeqToArray);
  var outputTarget = document.querySelector("#result");
  outputTarget.value = result;
}

function writeResultCaseClass (className, adjustmentObj) {
	var result = "";
	result += "## " + className + "\n";
	for(var i in adjustmentObj) {
		var optionalStr = adjustmentObj[i]["optional"] ? "optional" : "required";
		result += '+ ' +adjustmentObj[i]["propertyName"]+ ' (' + optionalStr + ', ' + adjustmentObj[i]["classType"] + ') \n';
	}
	return result;
}

function parsepropertiestring(propertiestr) {
	return propertiestr.map(function(prop) {
		// return prop.split(':');
		var res = prop.split(':');
		var next = {};
		next["propertyName"] = res[0];
		next["classType"] = res[1];
		return next;
	});
}

function replaceSeqToArray(propertieStr) {
	return propertieStr.map(function(prop) {
		var seqReg = /Seq/;
		if(prop["classType"].match(seqReg)) {
			prop["classType"] = prop["classType"].replace(/Seq/, "array")
		}
		return prop;
	});
}

function removeStringOfOptional(properties) {
	return properties.map(function(prop) {
		if(prop["optional"]) {
			removedOptionalClassType = prop["classType"].replace(/Option\[/, "").replace(/\]$/, "");
			prop["classType"] = removedOptionalClassType;
		}
		return prop;
	});
}

//
function AddOptionalProperty(properties) {
	var res = properties.map(function(property, index) {
		if(optionalCheck(property["classType"])) {
			properties[index]["optional"] = true;
		} else {
			properties[index]["optional"] = false;
		}
		return property;
	});
	return res;
}

function optionalCheck(typeString) {
	var optionalFirstMatch = /Option\[/;
	if (typeString.match(optionalFirstMatch)) {
		return true;
	}
	return false;
}

//
function splitProperty (minimalStr) {
	var propertyMatchReg = /\(.+\)$/;
	var propertyValueStr = minimalStr.match(propertyMatchReg)[0];
	var splitedProperty = propertyValueStr.split(',');
	//先頭の ( と 末端の ) を消す
	var deleteHeadAndTailBracketReg = /(^\(|\)$)/;
	return splitedProperty.map(function(prop){
		return prop.replace(deleteHeadAndTailBracketReg, '');
	});
}

// Case Classの名前
function getClassName(minimalStr) {
	var CASECLASS = 'caseclass';
	var classNameReg = /(?:caseclass).+?(?=\()/;
	var className = minimalStr.match(classNameReg);
	className[0] = className[0].substr(CASECLASS.length);
	return className;
}

// Case Classのコメント・空白・改行の削除
function minimalize(caseClassStr) {
	//コメントを消す
	var deleteCommentReg = /\/.*\n/g;
	//スペース、タブなどを消す
	var minimalizeReg = /\s/g;
	var deletedStr = caseClassStr.replace(deleteCommentReg, '');
	var minimalizedStr = deletedStr.replace(minimalizeReg, '');
	return minimalizedStr;
}

function addPlaceholder() {
  var placeholderStr = "";
  placeholderStr += "case class AgentUser(\n";
  placeholderStr += "  id: String, // TODO(hoge) 不要なコメント\n";
  placeholderStr += "  optionalString: Option[String],\n";
  placeholderStr += "  timestamp: java.sql.Timestamp,\n";
  placeholderStr += "  originalType: Option[OriginalType],\n";
  placeholderStr += "  optionalSeq: Option[Seq[Int]]\n";
  placeholderStr += ")\n";
  var inputTextArea = document.querySelector('#inputArea');
  inputTextArea.setAttribute("placeholder", placeholderStr);
}
