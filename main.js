// TODO Optionalが中に入ってるパターンはパースできないです。
// TODO デフォルト値の設定もできるようにしたい
window.onload = function(){
  init();
}

function init() {
  addPlaceholder();
  var parserButton = document.querySelector("#parserButton");
  parserButton.addEventListener('click', function(){parseCassClassToApiBlueprint()}, false);
}

function parseCassClassToApiBlueprint() {
  var inputValue = document.querySelector('#inputArea').value;
  var minimalizedCaseClass = minimalize(inputValue);
  var removedComment = minimalizedCaseClass.replace(/^\/\*/, "").replace(/\*\/$/, "");
  var className = getClassName(minimalizedCaseClass);
  var propertiesStr = splitProperty(removedComment);
  var properties = parsepropertieString(propertiesStr);
  var result = AddOptionalProperty(properties);
  var processingObj = removeStringOfOptional(result);
  var replacedSeqToArray = replaceSeqToArray(processingObj);
  var parsedBaseType = parseApiBlueprintBaseType(replacedSeqToArray);
  var result = writeResultCaseClass(className, parsedBaseType);
  var outputTarget = document.querySelector("#result");
  outputTarget.value = result;
}

// API Blueprint形式にフォーマット化した文字列を返す。
function writeResultCaseClass (className, adjustmentObj) {
	var result = "";
	result += "## " + className + "\n";
	for(var i in adjustmentObj) {
		var optionalStr = adjustmentObj[i]["optional"] ? "optional" : "required";
		result += '+ ' +adjustmentObj[i]["propertyName"]+ ' (' + optionalStr + ', ' + adjustmentObj[i]["classType"] + ') \n';
	}
	return result;
}

//１プロパティの塊となる文字列をプロパティ名・プロパティの方に分割する
function parsepropertieString(propertiestr) {
	return propertiestr.map(function(prop) {
		var res = prop.split(':');
		var next = {};
		next["propertyName"] = res[0];
		next["classType"] = res[1];
		return next;
	});
}

// ScalaではSeq()だが、API Blueprint では arrayなので変換を行う
function replaceSeqToArray(propertieStr) {
	return propertieStr.map(function(prop) {
		var seqReg = /Seq/;
		if(prop["classType"].match(seqReg)) {
			prop["classType"] = prop["classType"].replace(/Seq/, "array")
		}
		return prop;
	});
}

// API Blueprint印字時に Optionの文字は不要なため、削除する
function removeStringOfOptional(properties) {
	return properties.map(function(prop) {
		if(prop["optional"]) {
			removedOptionalClassType = prop["classType"].replace(/Option\[/, "").replace(/\]$/, "");
			prop["classType"] = removedOptionalClassType;
		}
		return prop;
	});
}

//optionalであるならばプロパティの属性にoptionalの属性を付与する
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

// typeがoptionalであるかをチェックする
function optionalCheck(typeString) {
	var optionalFirstMatch = /Option\[/;
	if (typeString.match(optionalFirstMatch)) {
		return true;
	}
	return false;
}

//プロパティにあたる文字列を、それぞれ個別のプロパティに分割
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

// Case ClassのClass Nameを取得
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

function replaceBaseTypeForApiBlueprint (typeStr) {
  var numberReg = /[(Int)|()]/
}

function parseApiBlueprintBaseType(prop) {
  console.log(prop);
  return prop.map(function(p){
    var numberTypeReg = /(Int)|(Long)/
    var stringTypeReg = /(String)/
    var booleanTypeReg = /Boolean/
    console.log(p["propertyName"]);
    p["classType"] = p["classType"].replace(numberTypeReg, "number");
    p["classType"] = p["classType"].replace(stringTypeReg, "string");
    p["classType"] = p["classType"].replace(booleanTypeReg, "boolean");
    return p;
  });
}
