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
            if (index > 0) {
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

function main() {
    const fileURL = new URL("./repos.json", window.location.href).href;

    // Use fetch or other methods to read the file content
    fetch(fileURL)
        .then((response) => response.text())
        .then((data) => {
            var repos = JSON.parse(data);
            for (const repoKey of Object.keys(repos)) {
                var repo = repos[repoKey];

                var div = document.createElement("div");
                div.classList.add("repo-container");
                div.id = repoKey;

                fetch(repo.readme_path)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Network response was not ok");
                        }
                        return response.text();
                    })
                    .then((data) => {
                        (function (repoData) {
                            var iter = stringIterator(data);
                            var char;

                            while ((char = iter.next()) && !char.value.done) {
                                if (
                                    char.value == "h" &&
                                    iter.prevItem().value == "\n"
                                ) {
                                    var ishttps = data
                                        .substring(char.index)
                                        .match(/https[^\n]*\n/g);
                                    if (ishttps.length > 0) {
                                        var link = ishttps[0].replace("\n", "");
                                        var rawLink = link.replace(
                                            "https://",
                                            ""
                                        );
                                        var parts = rawLink.split("/");
                                        var user = parts[1];
                                        var repo = parts[2];
                                        var hash = parts[4];
                                        var path = parts.splice(
                                            5,
                                            parts.length - 1
                                        );
                                        var fileRaw =
                                            path[path.length - 1].split("#");
                                        path[path.length - 1] = fileRaw[0];

                                        var lines = fileRaw[1]
                                            .split("-")
                                            .map((x) =>
                                                parseInt(x.replace("L", ""))
                                            );
                                        var rawFileLink = `${
                                            repoData.raw_file_url
                                        }/${user}/${repo}/${hash}/${path.join(
                                            "/"
                                        )}`;

                                        Promise.all([
                                            fetch(rawFileLink).then(
                                                (response) => response.text()
                                            ),
                                            Promise.resolve(lines),
                                        ]).then(([codeText, lines]) => {
                                            var pre =
                                                document.createElement("pre");
                                            var codeElement =
                                                document.createElement("code");
                                            var code = codeText
                                                .split("\n")
                                                .slice(lines[0] - 1, lines[1])
                                                .join("\n");
                                        
                                            pre.appendChild(codeElement);
                                            div.appendChild(pre);

                                            var lang = () => {
                                                switch (
                                                    fileRaw[0].split(".")[1]
                                                ) {
                                                    case "cs":
                                                        return "text/x-csharp";
                                                    default:
                                                        break;
                                                }
                                            };
                                            CodeMirror(codeElement, {
                                                value: code,
                                                mode: lang(),
                                                theme: "blackboard",
                                                lineNumbers: false,
                                                readOnly: true,
                                            });
                                        });

                                        iter.goToIndex(
                                            char.index + link.length
                                        );
                                        continue;
                                    }
                                } else if (char.value == "#") {
                                    var idx = char.index;
                                    var headerLine = data
                                        .substring(idx)
                                        .match(/#(.*?)\n/g)[0];

                                    var headerCount = (
                                        headerLine.match(/#/g) || []
                                    ).length;

                                    var header = document.createElement(
                                        "h" + headerCount
                                    );
                                    header.textContent = headerLine.replace(
                                        /#/g,
                                        ""
                                    );
                                    div.appendChild(header);

                                    iter.goToIndex(idx + headerLine.length);
                                    continue;
                                } else if (char.value == "<") {
                                    var line = data
                                        .substring(char.index)
                                        .match(/<.*?>/g)[0];
                                }
                            }
                        })(repo);
                    })
                    .catch((error) => {});

                document.body.appendChild(div);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}
