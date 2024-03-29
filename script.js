// TODO: populate website navbar with project names, and change the page content based on the project selected

document.addEventListener("DOMContentLoaded", main, false);

function stringIterator(str, startIndex = 0) {
    let index = startIndex;

    return {
        next: function () {
            if (index < str.length) {
                return { value: str[index++], done: false, index: index - 1 };
            } else {
                return { done: true };
            }
        },
        goToIndex: function (idx) {
            if (idx < str.length) {
                index = idx;
                return { value: str[index++], done: false, index: index - 1 };
            } else {
                return { done: true };
            }
        },
        prevItem: function () {
            if (index > 1) {
                return { value: str[index - 2], done: false, index: index - 2 };
            } else {
                return { done: true };
            }
        },
        nextItem: function () {
            if (index < str.length) {
                return { value: str[index], done: false, index: index };
            } else {
                return { done: true };
            }
        },
    };
}

function createCodeBlock(code, lang, div, headerData) {
    // Create HTML elements and append them to the div
    const childDiv = document.createElement("div");
    const pre = document.createElement("pre");
    pre.classList.add("border");
    pre.classList.add("code-block");
    const codeElement = document.createElement("code");

    pre.appendChild(codeElement);

    if (headerData != undefined) {
        pre.classList.add("rounded-bottom");
        const headerDiv = document.createElement("div");
        const aref = document.createElement("a");
        aref.href = headerData.link;
        aref.innerHTML = headerData.path.join("/");
        aref.style.fontSize = "80%";
        const p = document.createElement("h6");
        p.innerHTML = `Lines ${headerData.lines[0]} to ${headerData.lines[1]}`;
        p.style.fontSize = "80%";

        headerDiv.appendChild(aref);
        headerDiv.appendChild(p);
        headerDiv.classList.add("code-block-header");
        headerDiv.classList.add("border");
        headerDiv.classList.add("rounded-top");

        childDiv.appendChild(headerDiv);
    } else {
        pre.classList.add("rounded");
        pre.classList.add("single-code-block");
    }

    childDiv.appendChild(pre);
    div.appendChild(childDiv);

    var numLines = code.split("\n").length;
    // Initialize CodeMirror
    CodeMirror(codeElement, {
        value: code,
        mode: lang,
        theme: "base16-dark",
        lineNumbers: true,
        indentWithTabs: true,
        matchClosing: true,
        readOnly: true,
    });

    pre.childNodes.forEach((child) => {
        child.childNodes.forEach((code) => {
            if (code.classList.contains("CodeMirror")) {
                code.style.height = `${getLineHeight(code) * (numLines + 1)}px`;
            }
        });
    });
}

function getLineHeight(el) {
    var temp = document.createElement(el.nodeName),
        ret;
    temp.setAttribute(
        "style",
        "margin:0; padding:0; " +
            "font-family:" +
            (el.style.fontFamily || "inherit") +
            "; " +
            "font-size:" +
            (el.style.fontSize || "inherit")
    );
    temp.innerHTML = "A";

    el.parentNode.appendChild(temp);
    ret = temp.clientHeight;
    temp.parentNode.removeChild(temp);

    return ret;
}

async function fetchAndCreateCodeBlock(readmeData, char, repoData, div) {
    var ishttps = readmeData.substring(char.index).match(/https[^\n]*\n/g);
    if (ishttps.length == 0) {
        return 0;
    }
    var link = ishttps[0].replace("\n", "");
    var rawLink = link.replace("https://", "");
    var parts = rawLink.split("/");
    var user = parts[1];
    var repo = parts[2];
    var hash = parts[4];
    var path = parts.splice(5, parts.length - 1);
    var fileRaw = path[path.length - 1].split("#");
    path[path.length - 1] = fileRaw[0];

    var lines = fileRaw[1].split("-").map((x) => parseInt(x.replace("L", "")));
    var rawFileLink = `${
        repoData.raw_file_url
    }/${user}/${repo}/${hash}/${path.join("/")}`;

    // Fetch code using fetch
    const response = await fetch(rawFileLink);
    const codeText = await response.text();

    // Extract the desired lines of code
    const code = codeText
        .split("\n")
        .slice(lines[0] - 1, lines[1])
        .join("\n");

    const lang = () => {
        switch (fileRaw[0].split(".")[1]) {
            case "cs":
                return "text/x-csharp";
            default:
                break;
        }
    };

    var headerData = {
        link: link,
        path: path,
        lines: lines,
    };

    createCodeBlock(code, lang(), div, headerData);

    return ishttps[0].length;
}

function createHTMLTag(readmeData, char, repoData, div) {
    var tag = undefined;
    var block = readmeData.substring(char.index).match(/<.*?>/g)[0];
    if (block.includes("</")) {
        tag = undefined;
    } else {
        var tag = block.match(/<[^\s]*?>/g);
        tag ??= block.match(/([^<].*?)\s/g);

        tag = tag[0].replace(" ", "").replace("<", "").replace(">", "");

        tag = document.createElement(tag);
        switch (tag.tagName.toLowerCase()) {
            case "img":
                var srcRaw = block.match(/(?<=src=").*?(?=">)/g)[0];
                var src = `${repoData.media_file_url}/${repoData.user}/${repoData.repo}/${repoData.branch}/${srcRaw}`;
                tag.src = src;

                tag.classList.add("repo-image");
                tag.classList.add("border");
                tag.classList.add("rounded");
                break;
            case "button":
                var srcRaw = block.match(/(?<=onclick=").*?(?=">)/g)[0];
                tag.onclick = () => {
                    window.open(srcRaw, "_blank");
                };
                tag.classList.add("btn");
                tag.classList.add("btn-secondary");
                tag.classList.add("btn-sm");

                tag.classList.add("repo-external-button");
                break;
        }
        div.appendChild(tag);
    }
    return { len: block.length, tag: tag };
}

function createHeaderElement(readmeData, char, div) {
    var headerLine = readmeData.substring(char.index).match(/#(.*?)\n/g)[0];

    var headerCount = (headerLine.match(/#/g) || []).length;

    var header = document.createElement("h" + headerCount);
    header.textContent = headerLine.replace(/#/g, "");
    div.appendChild(header);
    return headerLine.length;
}

function createGithubCodeBlock(readmeData, char, div, tag) {
    var block = readmeData.substring(char.index).match(/`{1,3}[^`]*`{1,3}/g)[0];
    var tildeCount = block.match(/`+(?=[^`])/g)[0].length;

    switch (tildeCount) {
        case 1:
            var mono = block.replace(/`/g, "");
            var span = document.createElement("span");
            span.classList.add("mono");
            span.classList.add("border");
            span.classList.add("rounded");
            span.innerHTML = mono;
            if (tag) {
                tag.appendChild(span);
            } else {
                div.appendChild(span);
            }
            break;
        case 3:
            lang = () => {
                var l = block.match(/(?<=`{3}).*(?=\s)/g)[0];
                switch (l) {
                    case "C#":
                        return "text/x-csharp";
                    default:
                        break;
                }
            };
            var code = block
                .replace(/`{3}.*\n/g, "")
                .replace(/`{3}/g, "")
                .trim();

            createCodeBlock(code, lang(), div);
            break;
        default:
            break;
    }
    return block.length;
}

function isNumeric(value) {
    return /^-?\d+$/.test(value);
}

const EMPTY_TAGS = ["IMG", "BUTTON"];
const EMPTY_CLASSES = ["CodeMirror"];
function clearEmptyElements(element) {
    for (const child of element.childNodes) {
        if (EMPTY_TAGS.some((x) => x == child.tagName)) {
            continue;
        }
        if (child.classList) {
            var classes = Array.from(child.classList);
            if (
                classes &&
                classes.length &&
                EMPTY_CLASSES.some((x) => classes.map((c) => c.includes(x)))
            ) {
                continue;
            }
        }
        if (/\S/g.test(child.textContent) == false) {
            child.remove();
        } else {
            clearEmptyElements(child);
        }
    }
}

async function createPageFromRepo(repo, repoKey) {
    var div = document.createElement("div");
    div.classList.add("repo-container");
    div.id = repoKey;
    document.body.appendChild(div);

    var readmeResponse = await fetch(repo.readme_path);
    var readmeData = await readmeResponse.text();

    var iter = stringIterator(readmeData);
    var char;

    var tags = [];
    do {
        var char = iter.next();
        if (char.done && char.value == undefined) {
            break;
        }
        if (char.value == "<" && iter.nextItem().value != "/") {
            var { len, tag } = createHTMLTag(readmeData, char, repo, div);
            tags.push(tag);
            iter.goToIndex(char.index + len - 1);
            continue;
        } else if (char.value == "<" && iter.nextItem().value == "/") {
            var block = readmeData.substring(char.index).match(/<.*?>/g)[0];
            tags.pop();
            iter.goToIndex(char.index + block.length - 1);
        } else if (char.value == "h" && iter.prevItem().value == "\n") {
            var len = await fetchAndCreateCodeBlock(
                readmeData,
                char,
                repo,
                div
            );
            if (len > 0) {
                iter.goToIndex(char.index + len - 1);
                continue;
            }
        } else if (
            char.value == "#" &&
            (() => {
                if (iter.prevItem().value == undefined) {
                    return true;
                }
                return /[\s]/g.test(iter.prevItem().value);
            })()
        ) {
            var len = createHeaderElement(readmeData, char, div);

            iter.goToIndex(char.index + len - 1);
            continue;
        } else if (char.value == "`") {
            var len = createGithubCodeBlock(
                readmeData,
                char,
                div,
                tags[tags.length - 1]
            );
            iter.goToIndex(char.index + len - 1);
            continue;
        } else if (
            isNumeric(char.value) &&
            iter.prevItem().value == "\n" &&
            iter.nextItem().value == "."
        ) {
            var orderedList = readmeData
                .substring(char.index)
                .match(/(?<=\s|)\d..*/g);

            var list = orderedList[0];

            if (char.value == 1) {
                var ol = document.createElement("ol");
                tags[tags.length - 1].appendChild(ol);
                tags.push(ol);
            }
            var li = document.createElement("li");
            li.innerHTML = list.match(/(?<=\d.).*/g)[0];
            tags[tags.length - 1].appendChild(li);

            if (char.value != 1) {
                var items = readmeData
                    .substring(char.index)
                    .match(/\d(?=\.)/g);
                var last = -1;
                for (const item of items) {
                    if (parseInt(item) > last) {
                        last = item;
                    } else {
                        break;
                    }
                }

                if (parseInt(char.value) == last) {
                    if (tags[tags.length - 1].tagName == "OL") {
                        tags.pop();
                    }
                }
            }
            iter.goToIndex(char.index + list.length - 1);
            continue;
        }
        // TODO: Handle unordered list
        else if (tags.length > 0 && tags[tags.length - 1]) {
            tags[tags.length - 1].innerHTML += char.value;
        } else if (tags.length == 0 && /\S/g.test(char.value)) {
            var tag = document.createElement("p");
            div.appendChild(tag);
            tag.innerHTML += char.value;
            tags.push(tag);
        }
    } while (char && !char.done);
    clearEmptyElements(div);

}
async function main() {
    const fileURL = new URL("./repos.json", window.location.href).href;

    var reposResponse = await fetch(fileURL);
    var repos = JSON.parse(await reposResponse.text());

    // TODO: Image in mobile is too small
    for (const repoKey of Object.keys(repos)) {
        var repo = repos[repoKey];
        await createPageFromRepo(repo, repoKey);
        
    }
}
