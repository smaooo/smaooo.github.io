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

    // Create HTML elements and append them to the div
    const childDiv = document.createElement("div");
    const pre = document.createElement("pre");
    pre.classList.add("border");
    pre.classList.add("rounded-bottom");
    pre.classList.add("code-block");
    const codeElement = document.createElement("code");

    // TODO: Add code block title same as GitHub
    pre.appendChild(codeElement);

    const headerDiv = document.createElement("div");
    const aref = document.createElement("a");
    aref.href = link;
    aref.innerHTML = path.join("/");
    aref.style.fontSize = "80%";
    const p = document.createElement("h6");
    p.innerHTML = `Lines ${lines[0]} to ${lines[1]}`;
    p.style.fontSize = "80%";

    headerDiv.appendChild(aref);
    headerDiv.appendChild(p);
    headerDiv.classList.add("code-block-header");
    headerDiv.classList.add("border");
    headerDiv.classList.add("rounded-top");

    childDiv.appendChild(headerDiv);
    childDiv.appendChild(pre);
    div.appendChild(childDiv);

    // Determine the code block's language
    const lang = () => {
        switch (fileRaw[0].split(".")[1]) {
            case "cs":
                return "text/x-csharp";
            default:
                break;
        }
    };

    // Initialize CodeMirror
    CodeMirror(codeElement, {
        value: code,
        mode: lang(),
        theme: "base16-dark",
        lineNumbers: true,
        readOnly: true,
    });

    return ishttps[0].length;
}

function createHTMLTag(readmeData, char, repoData, div) {
    var latestTag = undefined;
    var block = readmeData.substring(char.index).match(/<.*?>/g)[0];
    if (block.includes("</")) {
        latestTag = undefined;
    } else {
        var tag = block.match(/<[^\s]*?>/g);
        tag ??= block.match(/([^<].*?)\s/g);

        // TODO: if button add href to it and bootstrap classes

        tag = tag[0].replace(" ", "").replace("<", "").replace(">", "");

        latestTag = document.createElement(tag);
        switch (tag) {
            case "img":
                var srcRaw = block.match(/(?<=src=").*?(?=">)/g)[0];
                var src = `${repoData.media_file_url}/${repoData.user}/${repoData.repo}/${repoData.branch}/${srcRaw}`;
                latestTag.src = src;
                
                latestTag.classList.add("repo-image");
                latestTag.classList.add("border");
                latestTag.classList.add("rounded");
                break;
            case "button":
                var srcRaw = block.match(/(?<=onclick=").*?(?=">)/g)[0];
                latestTag.onclick = () => {
                    window.open(srcRaw, "_blank");
                };
                latestTag.classList.add("btn");
                latestTag.classList.add("btn-secondary");
                latestTag.classList.add("btn-sm");

                latestTag.classList.add("repo-external-button");
                break;
        }
        div.appendChild(latestTag);
    }
    return { len: block.length, latestTag: latestTag };
}

function createHeaderElement(readmeData, char, div) {
    var headerLine = readmeData.substring(char.index).match(/#(.*?)\n/g)[0];

    var headerCount = (headerLine.match(/#/g) || []).length;

    var header = document.createElement("h" + headerCount);
    header.textContent = headerLine.replace(/#/g, "");
    div.appendChild(header);
    return headerLine.length;
}

async function main() {
    const fileURL = new URL("./repos.json", window.location.href).href;

    var reposResponse = await fetch(fileURL);
    var repos = JSON.parse(await reposResponse.text());

    for (const repoKey of Object.keys(repos)) {
        var repo = repos[repoKey];

        var div = document.createElement("div");
        div.classList.add("repo-container");
        div.id = repoKey;
        document.body.appendChild(div);

        var readmeResponse = await fetch(repo.readme_path);
        var readmeData = await readmeResponse.text();

        var iter = stringIterator(readmeData);
        var char;

        var latestTag = undefined;

        do {
            var char = iter.next();
            if (char.done && char.value== undefined) {
                break;
            }
            if (char.value == "<") {
                var { len, latestTag } = createHTMLTag(readmeData, char, repo, div);

                iter.goToIndex(char.index + len - 1);
                continue;
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
                    return iter.prevItem().value.match(/[\s]/g) != null;
                })()
            ) {
                var len = createHeaderElement(readmeData, char, div);

                iter.goToIndex(char.index + len - 1);
                continue;
            } else if (latestTag) {
                latestTag.innerHTML += char.value;
            } else if (latestTag == undefined && char.value.match(/\S/g)){
                latestTag = document.createElement("p");
                div.appendChild(latestTag);
                latestTag.innerHTML += char.value;
            }
        } while (char && !char.done);
    }
}
