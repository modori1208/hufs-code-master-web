import type { Language } from '@/lib/api/types';

/**
 * 언어별 기본 코드 템플릿. 사용자가 처음 문제에 접근할 때 채워지는 시작점입니다.
 */
export const CODE_TEMPLATES: Record<Language, string> = {
  C: `#include <stdio.h>

int main(void) {
    return 0;
}
`,
  CPP: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);
    return 0;
}
`,
  JAVA: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    }
}
`,
  PYTHON3: `import sys
input = sys.stdin.readline

`,
};
