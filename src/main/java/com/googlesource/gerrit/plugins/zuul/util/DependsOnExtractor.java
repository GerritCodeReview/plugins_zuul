// Copyright (C) 2020 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package com.googlesource.gerrit.plugins.zuul.util;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Extracts dependency information from texts. */
public class DependsOnExtractor {
  public List<String> extract(String commitMessage) {
    List<String> dependsOn = new ArrayList<>();
    Pattern pattern =
        Pattern.compile(
            "^Depends-On: (I[0-9a-f]{40})\\s*$", Pattern.MULTILINE | Pattern.CASE_INSENSITIVE);
    Matcher matcher = pattern.matcher(commitMessage);
    while (matcher.find()) {
      String key = matcher.group(1);
      dependsOn.add(key);
    }
    return dependsOn;
  }
}
